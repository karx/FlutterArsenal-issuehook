# FlutterArsenal-issuehook
Hooks and other supporting backend logic for [FlutterArsenal](https://flutterarsenal.com)
![flutter-arsenal-facebook-cover](https://user-images.githubusercontent.com/20480867/60738493-265e8300-9f7c-11e9-8a1f-4ec36ba4e4e1.jpg)


[![LICENSE](https://img.shields.io/github/license/karx/FlutterArsenal.svg)](https://raw.githubusercontent.com/karx/homepage/master/LICENSE)
### Currenly hosts one webhook - /newIssue
* On Issue open/edited
Looks for `project-request` or `issue-requests` and processes them.

* On Issue label addition
Looks`approved` label, and commits the new project/event to github.

