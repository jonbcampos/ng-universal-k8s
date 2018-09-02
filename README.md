# ngUniversalK8s

Angular Universal is great, but... there is just a little that can and should be done to make it nicer for Kubernetes. 

Honestly, the additions in this package are minor but the changes would be helpful for any project so that you can Containerize your server and have the appropriate services.

I call the Angular Universal Schematic kept up by the Angular team and then I overlay the outputted `server.ts` with a health check and a readiness check. Like I said, minor updates. 

## Getting Started
For the initial scaffolding (required before anything else cause it sets everything where it needs to be).
```bash
cd to/wherever/you/are/putting/your/project
ng new my-project
cd my-project/
ng add ng-universal-k8s
```

## Note
Did you already go through the [Angular Universal setup steps on your own from the Angular Site](https://angular.io/guide/universal)? That's great! You can still run this.