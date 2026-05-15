import { getHeadTags } from '../src/entry-server';
import express from 'express';
import cors from 'cors';

const ssr = express();

ssr.get('*', (req, res) => {
  const { title, description } = getHeadTags(req.url);
  
  // Формируем полный HTML сами
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <link rel="icon" type="image/svg+xml" href="./src/ui/assets/iconLogo.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
        href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"
        rel="stylesheet"
    />
    <link
        href="https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,100..900;1,100..900&display=swap"
        rel="stylesheet"
    />
    <link
        href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap"
        rel="stylesheet"
    />
</head>
<body>
    <div id="root"></div>
    <div id="modals"></div>
    <script type="module" src="/src/entry-client.tsx"></script>
</body>
</html>
  `;
  
  res.send(html);
});