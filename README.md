# Project Overview:
This is a vanilla version of bolt.new but using open source packages and maintaining a open source code base. This code base will have minimal commits in order to take the existing bolt.new codebase and update it to resemble the closed source version. This project could be extended by adding a plugin system to it and making it a bolt.diy like experience

## Goals:
Our goal is to create a clean codebase that mimics bolt.new feature set. Once the following is complete this will give us a good idea of the majority of the codebase and then we can decide on what files to refactor and how we want to structure them. Once the following is complete and the refactoring is done we can add any updates needed then we will only need some documentation before the plugin system.

### What's Been Already Completed:
- [x] clone bolt.new
- [x] lint and typecheck fixes
- [x] update dependances
- [x] fixed typo and grammar mistakes
- [x] example env
- [x] fixed cors issue
- [x] improved ui on smaller device
- [x] image attachment support
- [x] example env
- [x] docker support
- [x] update to the latest model
- [x] download project as zip
- [x] push to Github
- [x] open project in new tab
- [x] extra history item options
- [x] more code mirror support
- [x] git clone import
- [x] git clone import by url
- [x] starter projects
- [x] local folder import

### What's Still Needed:
- [ ] auto sync to local
- [ ] streaming text inside workbench
- [ ] auto fix for preview and terminal
- [ ] bolt's terminal in workbench
- [ ] show token useage
- [ ] revert to any point in history

### UX Changes To Think About:
- [ ] no sending of a message without api key set, pop a toast notification
- [ ] the ability to set the api in bolt
- [ ] plugin system
