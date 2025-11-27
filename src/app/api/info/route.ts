import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';

async function runYtDlpDump(url: string, useCookies: boolean): Promise<any> {
    return new Promise((resolve, reject) => {
        const args = ['--dump-json', '--flat-playlist'];

        if (useCookies) {
            args.push('--cookies-from-browser', 'chrome');
        }

        args.push(url);

        const ytDlp = spawn('yt-dlp', args);
        let stdout = '';
        let stderr = '';

        ytDlp.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        ytDlp.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        ytDlp.on('close', (code) => {
            if (code === 0) {
                try {
                    // yt-dlp might return multiple JSON objects (one per line) for playlists
                    const lines = stdout.trim().split('\n');
                    if (lines.length > 1) {
                        // It's likely a playlist/carousel where each line is an entry
                        const entries = lines.map(line => JSON.parse(line));
                        resolve({ _type: 'playlist', entries });
                    } else {
                        resolve(JSON.parse(stdout));
                    }
                } catch (e) {
                    reject(new Error('Failed to parse JSON output'));
                }
            } else {
                reject(new Error(stderr || `yt-dlp exited with code ${code}`));
            }
        });
    });
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
        // First attempt with cookies (preferred for everything now)
        let data;
        try {
            data = await runYtDlpDump(url, true);
        } catch (e: any) {
            // If cookie lock error, retry without cookies
            if (e.message?.includes('Could not copy Chrome cookie database')) {
                console.log('Cookie lock detected, retrying without cookies...');
                data = await runYtDlpDump(url, false);
            } else {
                throw e;
            }
        }

        // Process the data to simplify it for the frontend
        let responseData: any = {
            type: 'single',
            items: []
        };

        if (data._type === 'playlist' || (data.entries && data.entries.length > 0)) {
            // It's a carousel or story list
            responseData.type = 'list'; // Generic list, frontend can distinguish context
            responseData.title = data.title;

            // Map entries
            responseData.items = (data.entries || []).map((entry: any) => ({
                id: entry.id,
                url: entry.url || entry.webpage_url, // Some entries might just have webpage_url
                thumbnail: entry.thumbnail,
                is_video: entry.ext === 'mp4' || entry.vcodec !== 'none',
                original_url: entry.webpage_url
            }));
        } else {
            // Single item
            responseData.type = 'single';

            // Extract qualities if it's a video
            let qualities: { label: string, height: number }[] = [];
            if (data.formats) {
                const uniqueHeights = new Set<number>();
                data.formats.forEach((fmt: any) => {
                    // Filter for video formats that have a height
                    if (fmt.vcodec !== 'none' && fmt.height) {
                        uniqueHeights.add(fmt.height);
                    }
                });

                qualities = Array.from(uniqueHeights)
                    .sort((a, b) => b - a) // Descending order
                    .map(h => ({ label: `${h}p`, height: h }));
            }

            responseData.items = [{
                id: data.id,
                url: data.url || data.webpage_url,
                thumbnail: data.thumbnail,
                title: data.title || data.description || 'Instagram Reel',
                is_video: data.ext === 'mp4' || data.vcodec !== 'none',
                original_url: data.webpage_url,
                qualities: qualities
            }];
        }

        return NextResponse.json(responseData);

    } catch (error: any) {
        console.error('Info fetch error:', error);
        // Check for login error
        if (error.message?.includes('Instagram API is not granting access') || error.message?.includes('login')) {
            return NextResponse.json({ error: 'Login required. Please close Chrome and try again.' }, { status: 403 });
        }
        return NextResponse.json({ error: 'Failed to fetch media info' }, { status: 500 });
    }
}
