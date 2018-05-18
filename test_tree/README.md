A container for running the tree building pipeline and producing a newick file.

Build from the root of the project with:
```
docker build -t test_tree -f test_tree/Dockerfile .
```
Run it from within the directory of FASTAs that you want to build a tree. You'll need to provide a version tag in quotes, and a taxon ID.

To run it you will need to connect to the host Docker service, e.g.
```
docker run --rm -i -v $PWD:/data -v /var/run/docker.sock:/var/run/docker.sock -v ~/.docker:/root/.docker test_tree 'v0.2.8' 573
```