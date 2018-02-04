#!/usr/bin/env bash

ssh -i /home/adrian/.ssh/feasy-remote feasy@193.239.143.139 '
  rm -rf /home/admin/web/feasy.dev/public_html/0.map;
  rm -rf /home/admin/web/feasy.dev/public_html/0.chunk.js;
  rm -rf /home/admin/web/feasy.dev/public_html/main.bundle.js;
  '