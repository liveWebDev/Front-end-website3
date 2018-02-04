#!/usr/bin/env bash
npm run deploy;

scp -i /home/adrian/.ssh/feasy-remote dist/0.map feasy@192.168.0.51:/home/admin/web/feasy.dev/public_html
scp -i /home/adrian/.ssh/feasy-remote dist/0.chunk.js feasy@192.168.0.51:/home/admin/web/feasy.dev/public_html
scp -i /home/adrian/.ssh/feasy-remote dist/main.bundle.js feasy@192.168.0.51:/home/admin/web/feasy.dev/public_html
#scp -i /home/adrian/.ssh/feasy-remote dist/index.html feasy@217.30.205.209:/home/admin/web/feasy.dev/public_html
#scp -i /home/adrian/.ssh/feasy-remote dist/main.map feasy@217.30.205.209:/home/admin/web/feasy.dev/public_html

#69.67.56.205
#scp -i /home/adrian/.ssh/dev.feasy.me dist/0.map feasy@69.67.56.205:/home/admin/web/feasy.dev/public_html
#scp -i /home/adrian/.ssh/dev.feasy.me dist/0.chunk.js feasy@69.67.56.205:/home/admin/web/feasy.dev/public_html
#scp -i /home/adrian/.ssh/dev.feasy.me dist/main.bundle.js feasy@69.67.56.205:/home/admin/web/feasy.dev/public_html
#scp -i /home/adrian/.ssh/dev.feasy.me dist/index.html feasy@69.67.56.205:/home/admin/web/feasy.dev/public_html
#scp -i /home/adrian/.ssh/dev.feasy.me dist/main.map feasy@69.67.56.205:/home/admin/web/feasy.dev/public_html