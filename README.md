# ScreepsAS

## *Screeps artificial stupidity*

#  1. ~~Intro~~ Deprecated

This repo will no longer receive updates. I'm currently refactoring this whole thing in typecript in my other repo.

However, what left here is a self-sufficient, use slightly under 20 ms (which is 20 CPU, the "free" player limit) per execution. It supports basic function like mining, upgrading, single room defense and auto-building. Note that manually planning is required. You'll need to put down construction site and it'll be build when the base is stabilized.

# 2. Structure and Design

## Roles

### Harvester //TODO

### Upgrader //TODO

### Transfer //TODO

## Showcasing auto-building

Place `ConstructionSite` on the map.

 ![Before](/Info/showcase_before.jpeg)

And below were screenshot roughly after 1 day:

 ![After](/Info/showcase_after1d.jpeg)
## Task system
### Update: This is the last straw, writing a task system. As I working through it, I realized how much hazard it's without a type system.

Using the "role system" which the tutorial implied is intuitive but inefficient. It lacks of diversify and creating a dozens of similarly functioned creeps for no reason. And for free-to-player user , the 20 ms runtime. the task design is super general. This game, screeps, is all about moving "things" around. For example, `energies` been *`harvested`* from `source`, *`dropped`* to `containers` and then transported into `extensions` or being used on `upgradeController`.

`harvested` source --> `transfer` StructureSpawn

Therefore, creeps are merely "moving company". They take stuff (energies, minerals, etc)

## Should attack be fully automated?

The fact is, no matter how smart an AI is, it'll always be dumber than the dumbest human, unless one can somehow write a deep-learning AI for his screeps (let me know if anyone made it. Like, for real, let me know). Therefore, this code only implement basic defenses but leave those big-brain operations to user.

## A Grunt Guide for those who have little coding experience

I have to admit, it was very confusing when I first started, and I doubt there're any fullstack dev would play coding game after work. So here's a incompetent grunt guide for screep.

### TL;DR version
There's a more comprehend version below if you get lost in these steps.

1. type in below line-by-line:
```
npm install -g grunt-cli
cd <your folder directory>
npm init
npm install grunt --save-dev
npm install grunt-contrib-clean --save-dev
npm install grunt-contrib-copy --save-dev
npm install grunt-file-append --save-dev
npm install grunt-jsbeautifier --save-dev
npm install grunt-rsync --save-dev
npm install grunt-screeps --save-dev
npm install time-grunt --save-dev
```

2. Copy this [`GruntFile.js`](https://docs.screeps.com/contributed/advanced_grunt.html#Full-Example) and set up you own [`.screeps.json`](https://docs.screeps.com/contributed/advanced_grunt.html#Secure-Credentials)

3. Push your local scripts to Screeps server by typing in `grunt screeps` in your cmd/terminal.

### The Full version:

1. Install [NPM](https://www.npmjs.com/get-npm) on your pc.
2. type `npm install -g grunt-cli` in cmd (Windows) or terminal (MacOS). If MacOS return an error message saying things like `access denied`, use `sudo npm install -g grunt-cli` to force it. Since you used `sudo`, you might need to type in your log-in password to confirm.
3. Guide your cmd/terminal to your scripts' root folder. If you don't know how, go search "how to change directory in _____(insert your operating system)".
4. type `npm init`. This will create a package.json, which is essential for next few steps. It'll ask you a few questions. Answer as you wish or just hold down Enter. A more detailed, official guide [here](https://gruntjs.com/getting-started#package.json).
5. If you now run `npm list -depth=0`, it should return a line, start with the name & version you gave in last step. And follow by a directory of your scripts folder. If so, you're good to go. If not, check your previous steps.
6. Type in `npm install grunt --save-dev` and then also type in all commands starts with `npm install...` in this [guide](https://docs.screeps.com/contributed/advanced_grunt.html).  And don't forget to save the [example file](https://docs.screeps.com/contributed/advanced_grunt.html#Full-Example) as `GruntFile.js` . My GruntFile is the same as this example but with some extra comments for non-coders.
7. type in [`grunt test`](https://docs.screeps.com/contributed/advanced_grunt.html#Beautify),then read the message it returns. If the message didn't say you **missing** something, then you're fine.
8. Finally, set up your [`.screeps.json`](https://docs.screeps.com/contributed/advanced_grunt.html#Secure-Credentials).
9. Be careful, safety is off. By "**pushing code**", you'll wipe out all your server scripts and replace it with the scripts in your local folder. If you're ready, type in `grunt screeps` to push your local code to the official server.

# Note for self

`Object.values(Game.structures).some(s => s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_ROAD || s.structureType === STRUCTURE_RAMPART || s.structureType === STRUCTURE_WALL)` === false
`Game.constructionSite` include construction sites without vision. Those sites has `.pos` (RoomPosition) but no `.room`
