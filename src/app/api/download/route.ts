import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

function logDebug(message: string) {
    const logPath = path.join(process.cwd(), 'debug.log');
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`);
}

async function runYtDlp(args: string[]): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const ytDlp = spawn('yt-dlp', args);
        let stderr = '';

        ytDlp.stdout.on('data', (data) => {
            logDebug(`stdout: ${data}`);
        });

        ytDlp.stderr.on('data', (data) => {
            const msg = data.toString();
            logDebug(`stderr: ${msg}`);
            stderr += msg;
        });

        ytDlp.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(stderr || `yt-dlp exited with code ${code}`));
            }
        });

        ytDlp.on('error', (err) => {
            reject(err);
        });
    });
}

export async function GET(request: NextRequest) {
    console.log('API /api/download HIT');
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');
    const format = searchParams.get('format') || 'mp4';
    const playlistItems = searchParams.get('playlist_items');
    const quality = searchParams.get('quality'); // e.g. '1080', '720'

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir);
    }

    const fileId = randomUUID();
    let filename = 'instagram_media';
    let contentType = 'application/octet-stream';

    const outputTemplate = path.join(tmpDir, `${fileId}.%(ext)s`);

    logDebug(`Starting download: URL=${url}, Format=${format}, Quality=${quality}, ID=${fileId}, Items=${playlistItems}`);

    // Base args based on format
    let baseArgs: string[] = [];
    switch (format) {
        case 'mp3':
            filename = 'instagram_audio.mp3';
            contentType = 'audio/mpeg';
            baseArgs = ['-x', '--audio-format', 'mp3', '-o', outputTemplate, url];
            break;
        case 'jpg':
            filename = 'instagram_image.jpg';
            contentType = 'image/jpeg';
            baseArgs = ['-o', outputTemplate, url];
            break;
        case 'mp4':
        default:
            filename = 'instagram_video.mp4';
            contentType = 'video/mp4';

            if (quality) {
                // Select best video up to the requested height
                // We use <=? to allow fallback if exact height isn't found, but typically we want the best under that cap.
                const formatSelector = `bestvideo[height<=${quality}]+bestaudio/best[height<=${quality}]`;
                baseArgs = ['-f', formatSelector, '-o', outputTemplate, url];
            } else {
                baseArgs = ['-f', 'best', '-o', outputTemplate, url];
            }
            break;
    }

    // Add playlist items if specified
    if (playlistItems) {
        // Remove the URL from the end, add playlist items, then add URL back
        const urlArg = baseArgs.pop();
        baseArgs.push('--playlist-items', playlistItems);
        if (urlArg) baseArgs.push(urlArg);
    }

    // Attempt 1: Try with cookies
    try {
        logDebug('Attempting download WITH cookies...');
        await runYtDlp(['--cookies-from-browser', 'chrome', ...baseArgs]);
    } catch (error: any) {
        const errorMsg = error.message || '';
        logDebug(`Cookie attempt failed: ${errorMsg}`);

        // Check if failure was due to cookie lock
        if (errorMsg.includes('Could not copy Chrome cookie database')) {
            logDebug('Cookie database locked. Retrying WITHOUT cookies...');
            try {
                await runYtDlp(baseArgs);
            } catch (retryError: any) {
                logDebug(`Retry failed: ${retryError.message}`);

                // Check if the retry failed because login is required
                if (retryError.message.includes('Instagram API is not granting access') ||
                    retryError.message.includes('sign in') ||
                    retryError.message.includes('login')) {
                    return NextResponse.json({
                        error: 'This post requires login. Please close your Chrome browser and try again so the app can access your cookies.'
                    }, { status: 403 });
                }

                return NextResponse.json({ error: 'Failed to process download' }, { status: 500 });
            }
        } else {
            // Some other error (e.g. 404, or actual login required but cookies didn't help/work)
            return NextResponse.json({ error: 'Failed to process download' }, { status: 500 });
        }
    }

    try {
        // Find the file that starts with the fileId
        const files = fs.readdirSync(tmpDir);
        const downloadedFile = files.find(f => f.startsWith(fileId));

        if (!downloadedFile) {
            logDebug('File not found after download');
            throw new Error('File was not created by yt-dlp');
        }

        const targetFilePath = path.join(tmpDir, downloadedFile);
        logDebug(`File found: ${targetFilePath}`);

        const fileBuffer = fs.readFileSync(targetFilePath);

        // Cleanup
        fs.unlinkSync(targetFilePath);

        // Determine content type
        const ext = path.extname(downloadedFile).toLowerCase();
        if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        else if (ext === '.png') contentType = 'image/png';
        else if (ext === '.webp') contentType = 'image/webp';
        else if (ext === '.mp4') contentType = 'video/mp4';
        else if (ext === '.mp3') contentType = 'audio/mpeg';

        // Update filename extension
        filename = filename.replace(/\.[^/.]+$/, "") + ext;

        const headers = new Headers();
        headers.set('Content-Disposition', `attachment; filename="${filename}"`);
        headers.set('Content-Type', contentType);
        headers.set('Content-Length', fileBuffer.length.toString());

        return new NextResponse(fileBuffer, { headers });

    } catch (error: any) {
        logDebug(`Error during file handling: ${error.message}`);
        // Cleanup
        if (fs.existsSync(tmpDir)) {
            const files = fs.readdirSync(tmpDir);
            const relatedFiles = files.filter(f => f.startsWith(fileId));
            relatedFiles.forEach(f => fs.unlinkSync(path.join(tmpDir, f)));
        }
        return NextResponse.json({ error: 'Failed to process download' }, { status: 500 });
    }
}
