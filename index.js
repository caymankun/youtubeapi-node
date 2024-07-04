const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// GETリクエストを処理するエンドポイント
app.get('/download', async (req, res) => {
    try {
        const videoUrl = req.query.url; // YouTubeの動画URL
        const outputDir = './downloads'; // ダウンロード先のディレクトリ

        // yt-dlpのコマンドを組み立てる
        const command = `yt-dlp --no-check-certificate -f bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best --merge-output-format mp4 ${videoUrl} -o '${outputDir}/%(title)s.%(ext)s'`;

        // コマンドを実行して動画をダウンロード
        exec(command, async (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                res.status(500).json({ error: 'Failed to download video' });
                return;
            }

            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);

            // ダウンロードしたファイルのパスを取得
            const files = await fs.promises.readdir(outputDir);
            const downloadedFile = path.join(outputDir, files[0]);

            // ファイルをBase64エンコードしてレスポンスとして返す
            fs.readFile(downloadedFile, (err, data) => {
                if (err) {
                    console.error(`Error reading file: ${err.message}`);
                    res.status(500).json({ error: 'Failed to read video file' });
                    return;
                }

                // ファイルを削除
                fs.unlink(downloadedFile, (err) => {
                    if (err) {
                        console.error(`Error deleting file: ${err.message}`);
                    }
                    console.log('File deleted successfully');
                });

                // Base64エンコードしてレスポンスとして送信
                const base64data = data.toString('base64');
                res.send(base64data);
            });
        });
    } catch (err) {
        console.error(`Error: ${err.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// サーバーを起動する
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
