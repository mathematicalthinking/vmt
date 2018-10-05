# GIT FORK REPO

1. fork this repo into your own github account (click fork in upper right of [VMT page](https://github.com/mathematicalthinking/vmt)
1. On your own fork of this repo, click the clone or download button, and copy the ssh key link (e.g. git@github.com:--githubUserName--/vmt.git), or https web url (e.g. https://github.com/--githubUserName--/vmt.git)
1. cd to directory to be parent of repo
1. ensure there is no file or directory named encompass in it
1. git clone --your 'ssh key link' or 'https web url' here--
1. cd vmt
1. add remote repository. Depending on how you connect with github:
    * if through ssh, it should be:

      git remote add upstream git@github.com:mathematicalthinking/vmt.git
    * or if through https, it should be:

      https://github.com/mathematicalthinking/vmt.git
1. git remote add upstream
1. git remote -v (to confirm)

