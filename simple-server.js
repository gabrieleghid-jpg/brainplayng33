const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3010;
const PUBLIC_DIR = path.join(__dirname, 'src');

const server = http.createServer((req, res) => {
    console.log(`Request: ${req.method} ${req.url}`);
    
    // Gestisci le route principali
    if (req.url === '/') {
        req.url = '/pages/index.html';
    } else if (req.url.endsWith('.html') && !req.url.startsWith('/api/')) {
        // Se è un file .html, cercalo nella cartella pages
        if (!req.url.startsWith('/pages/')) {
            req.url = '/pages' + req.url;
        }
    } else if (!req.url.includes('.') && !req.url.startsWith('/api/')) {
        // Se è un path senza estensione e non è API, prova a cercarlo in pages/
        req.url = '/pages' + req.url + '.html';
    }
    
    const filePath = path.join(PUBLIC_DIR, req.url);
    
    // Controlla se il file esiste
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.log(`File not found: ${filePath}`);
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('File not found');
            return;
        }
        
        // Leggi e servi il file
        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.log(`Error reading file: ${filePath}`, err);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Server error');
                return;
            }
            
            // Determina il content type
            const ext = path.extname(filePath);
            let contentType = 'text/html';
            
            switch(ext) {
                case '.css':
                    contentType = 'text/css';
                    break;
                case '.js':
                    contentType = 'application/javascript';
                    break;
                case '.json':
                    contentType = 'application/json';
                    break;
            }
            
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
            console.log(`Served: ${filePath}`);
        });
    });
});

server.listen(PORT, () => {
    console.log(`Server semplice attivo su http://localhost:${PORT}`);
    console.log(`Directory pubblica: ${PUBLIC_DIR}`);
});
