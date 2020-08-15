## Docker

This project optionally uses [docker](https://docs.docker.com/) and [docker-compose](https://docs.docker.com/compose/)

After installing the appropriate version for your OS you can build and run the
project locally or on a server without installing anything else.

There are currently two files that control/allow this: `Dockerfile` and
`docker-compose.yml`

### Dockerfile

This indicates how to build the image for the vmt application (both the client
and the server)

### docker-compose.yml

This brings up the entire "stack", currently the vmt app and a mongo database

## Examples

### Building the vmt image

This will build the image based on the current project

`docker build -t mathematicalthinking/vmt .`

You should now see this image in your local images with `docker images`

This means it can be deployed via docker-compose

### Running the whole stack

This will use the standard file name of `docker-compose.yml` to run that file

`docker-compose up --force-recreate`

At which point you should be able to view localhost:3000 in your browser

This requires that nothing else is on the ports it wants to use, currently:
3000, 3001, 27017, but could be re-mapped easily

### Running the app on your host without mongodb installed

Instead of installing mondodb on your own, you can instead use a pre-packaged
mongodb docker container.  The advantage is that everyone will be using the
exact same version and settings.

This is what docker-compose is using when it runs the full stack.

This will run an image named `mongo` on the required port.  (If you already have it running it will conflict)
`docker run --name mongo -p 27017:27017 -d mongo mongod`

Stopping mongo is as easy as: `docker stop mongo`

## Next Steps

### Repository

So far our images are just built and used on individual machines.

An image repository should be used where versioned (tagged) images can be pushed, eg:

`docker tag mathematicalthinking/vmt someregistry:5000/mathematicalthinking/vmt:permanentversion`
`docker push someregistry:5000/mathematicalthinking/vmt:permanentversion`

And then someone else can run:
`docker pull someregistry:5000/mathematicalthinking/vmt:permanentversion`

### CI

Eventually CI could/should build, tag and push the images after tests pass.

This ensures that the images are built from a consistent source and are the immutable deployment artifacts.

### Deployment

Eventually instead of running the scripts for the app on bare metal docker can be used to run them.

(This likely would not replace mongo's server runtime as that is a permanent datastore and probably not suitable for production or long living data)
