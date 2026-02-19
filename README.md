# Micros-frontend

## Deployment (nginx)

If you get **404 on refresh** for routes like `/invest` (e.g. on https://dashboard.varntix.com/invest), nginx must serve the static HTML for that path. Next.js static export outputs `/invest` as `invest.html`.

Use the included **`nginx.conf`**: set `root` to your build output (e.g. `/var/www/dashboard.varntix.com/build`) and ensure the `location /` block uses:

```nginx
try_files $uri $uri.html $uri/ $uri/index.html /index.html =404;
```

Then reload nginx (`sudo nginx -t && sudo systemctl reload nginx`).