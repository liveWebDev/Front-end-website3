#!/usr/bin/env bash
npm run deploy;

cp dist/0.map ../feasy/data/public/
cp dist/0.chunk.js ../feasy/data/public/
cp dist/index.html ../feasy/data/public/
cp dist/main.bundle.js ../feasy/data/public/
cp dist/main.map ../feasy/data/public/
