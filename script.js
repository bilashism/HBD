//#region - start of - fullscreen 
/* Get the documentElement (<html>) to display the page in fullscreen */
var elem = document.documentElement;

/* View in fullscreen */
function openFullscreen() {
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { /* Firefox */
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE/Edge */
        elem.msRequestFullscreen();
    }
}
openFullscreen();
/* Close fullscreen */
// function closeFullscreen() {
//     if (document.exitFullscreen) {
//         document.exitFullscreen();
//     } else if (document.mozCancelFullScreen) { /* Firefox */
//         document.mozCancelFullScreen();
//     } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
//         document.webkitExitFullscreen();
//     } else if (document.msExitFullscreen) { /* IE/Edge */
//         document.msExitFullscreen();
//     }
// }
//#endregion - end of - fullscreen 

//#region - start of - canvas#cd 


var w = cd.width = window.innerWidth,
    h = cd.height = window.innerHeight,
    ctx = cd.getContext('2d'),

    hw = w / 2, // half-width
    hh = h / 2,
    opts = {
        strings: ['HAAPPPY', 'BIRTHHDAAY', 'BAABEEE'],
        charSize: 30,
        charSpacing: 30,
        lineHeight: 80,

        cx: w / 2,
        cy: h / 2,

        fireworkPrevPoints: 10,
        fireworkBaseLineWidth: 5,
        fireworkAddedLineWidth: 8,
        fireworkSpawnTime: 200,
        fireworkBaseReachTime: 30,
        fireworkAddedReachTime: 30,
        fireworkCircleBaseSize: 20,
        fireworkCircleAddedSize: 10,
        fireworkCircleBaseTime: 30,
        fireworkCircleAddedTime: 30,
        fireworkCircleFadeBaseTime: 10,
        fireworkCircleFadeAddedTime: 5,
        fireworkBaseShards: 5,
        fireworkAddedShards: 5,
        fireworkShardPrevPoints: 3,
        fireworkShardBaseVel: 4,
        fireworkShardAddedVel: 2,
        fireworkShardBaseSize: 3,
        fireworkShardAddedSize: 3,
        gravity: .2,
        upFlow: -.1,
        letterContemplatingWaitTime: 300,
        balloonSpawnTime: 10,
        balloonBaseInflateTime: 10,
        balloonAddedInflateTime: 10,
        balloonBaseSize: 25,
        balloonAddedSize: 50,
        balloonBaseVel: .4,
        balloonAddedVel: .4,
        balloonBaseRadian: -(Math.PI / 2 - .5),
        balloonAddedRadian: -1,
    },
    calc = {
        totalWidth: opts.charSpacing * Math.max(opts.strings[0].length, opts.strings[1].length)
    },

    Tau = Math.PI * 2,
    TauQuarter = Tau / 4,

    letters = [];

ctx.font = opts.charSize + 'px Verdana';

function Letter(char, x, y) {
    this.char = char;
    this.x = x;
    this.y = y;

    this.dx = -ctx.measureText(char).width / 2;
    this.dy = +opts.charSize / 2;

    this.fireworkDy = this.y - hh;

    var hue = x / calc.totalWidth * 360;

    this.color = 'hsl(hue,80%,50%)'.replace('hue', hue);
    this.lightAlphaColor = 'hsla(hue,80%,light%,alp)'.replace('hue', hue);
    this.lightColor = 'hsl(hue,80%,light%)'.replace('hue', hue);
    this.alphaColor = 'hsla(hue,80%,50%,alp)'.replace('hue', hue);

    this.reset();
}
Letter.prototype.reset = function() {

    this.phase = 'firework';
    this.tick = 0;
    this.spawned = false;
    this.spawningTime = opts.fireworkSpawnTime * Math.random() | 0;
    this.reachTime = opts.fireworkBaseReachTime + opts.fireworkAddedReachTime * Math.random() | 0;
    this.lineWidth = opts.fireworkBaseLineWidth + opts.fireworkAddedLineWidth * Math.random();
    this.prevPoints = [
        [0, hh, 0]
    ];
}
Letter.prototype.step = function() {

    if (this.phase === 'firework') {

        if (!this.spawned) {

            ++this.tick;
            if (this.tick >= this.spawningTime) {

                this.tick = 0;
                this.spawned = true;
            }

        } else {

            ++this.tick;

            var linearProportion = this.tick / this.reachTime,
                armonicProportion = Math.sin(linearProportion * TauQuarter),

                x = linearProportion * this.x,
                y = hh + armonicProportion * this.fireworkDy;

            if (this.prevPoints.length > opts.fireworkPrevPoints)
                this.prevPoints.shift();

            this.prevPoints.push([x, y, linearProportion * this.lineWidth]);

            var lineWidthProportion = 1 / (this.prevPoints.length - 1);

            for (var i = 1; i < this.prevPoints.length; ++i) {

                var point = this.prevPoints[i],
                    point2 = this.prevPoints[i - 1];

                ctx.strokeStyle = this.alphaColor.replace('alp', i / this.prevPoints.length);
                ctx.lineWidth = point[2] * lineWidthProportion * i;
                ctx.beginPath();
                ctx.moveTo(point[0], point[1]);
                ctx.lineTo(point2[0], point2[1]);
                ctx.stroke();

            }

            if (this.tick >= this.reachTime) {

                this.phase = 'contemplate';

                this.circleFinalSize = opts.fireworkCircleBaseSize + opts.fireworkCircleAddedSize * Math.random();
                this.circleCompleteTime = opts.fireworkCircleBaseTime + opts.fireworkCircleAddedTime * Math.random() | 0;
                this.circleCreating = true;
                this.circleFading = false;

                this.circleFadeTime = opts.fireworkCircleFadeBaseTime + opts.fireworkCircleFadeAddedTime * Math.random() | 0;
                this.tick = 0;
                this.tick2 = 0;

                this.shards = [];

                var shardCount = opts.fireworkBaseShards + opts.fireworkAddedShards * Math.random() | 0,
                    angle = Tau / shardCount,
                    cos = Math.cos(angle),
                    sin = Math.sin(angle),

                    x = 1,
                    y = 0;

                for (var i = 0; i < shardCount; ++i) {
                    var x1 = x;
                    x = x * cos - y * sin;
                    y = y * cos + x1 * sin;

                    this.shards.push(new Shard(this.x, this.y, x, y, this.alphaColor));
                }
            }

        }
    } else if (this.phase === 'contemplate') {

        ++this.tick;

        if (this.circleCreating) {

            ++this.tick2;
            var proportion = this.tick2 / this.circleCompleteTime,
                armonic = -Math.cos(proportion * Math.PI) / 2 + .5;

            ctx.beginPath();
            ctx.fillStyle = this.lightAlphaColor.replace('light', 50 + 50 * proportion).replace('alp', proportion);
            ctx.beginPath();
            ctx.arc(this.x, this.y, armonic * this.circleFinalSize, 0, Tau);
            ctx.fill();

            if (this.tick2 > this.circleCompleteTime) {
                this.tick2 = 0;
                this.circleCreating = false;
                this.circleFading = true;
            }
        } else if (this.circleFading) {

            ctx.fillStyle = this.lightColor.replace('light', 70);
            ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);

            ++this.tick2;
            var proportion = this.tick2 / this.circleFadeTime,
                armonic = -Math.cos(proportion * Math.PI) / 2 + .5;

            ctx.beginPath();
            ctx.fillStyle = this.lightAlphaColor.replace('light', 100).replace('alp', 1 - armonic);
            ctx.arc(this.x, this.y, this.circleFinalSize, 0, Tau);
            ctx.fill();

            if (this.tick2 >= this.circleFadeTime)
                this.circleFading = false;

        } else {

            ctx.fillStyle = this.lightColor.replace('light', 70);
            ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
        }

        for (var i = 0; i < this.shards.length; ++i) {

            this.shards[i].step();

            if (!this.shards[i].alive) {
                this.shards.splice(i, 1);
                --i;
            }
        }

        if (this.tick > opts.letterContemplatingWaitTime) {

            this.phase = 'balloon';

            this.tick = 0;
            this.spawning = true;
            this.spawnTime = opts.balloonSpawnTime * Math.random() | 0;
            this.inflating = false;
            this.inflateTime = opts.balloonBaseInflateTime + opts.balloonAddedInflateTime * Math.random() | 0;
            this.size = opts.balloonBaseSize + opts.balloonAddedSize * Math.random() | 0;

            var rad = opts.balloonBaseRadian + opts.balloonAddedRadian * Math.random(),
                vel = opts.balloonBaseVel + opts.balloonAddedVel * Math.random();

            this.vx = Math.cos(rad) * vel;
            this.vy = Math.sin(rad) * vel;
        }
    } else if (this.phase === 'balloon') {

        ctx.strokeStyle = this.lightColor.replace('light', 80);

        if (this.spawning) {

            ++this.tick;
            ctx.fillStyle = this.lightColor.replace('light', 70);
            ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);

            if (this.tick >= this.spawnTime) {
                this.tick = 0;
                this.spawning = false;
                this.inflating = true;
            }
        } else if (this.inflating) {

            ++this.tick;

            var proportion = this.tick / this.inflateTime,
                x = this.cx = this.x,
                y = this.cy = this.y - this.size * proportion;

            ctx.fillStyle = this.alphaColor.replace('alp', proportion);
            ctx.beginPath();
            generateBalloonPath(x, y, this.size * proportion);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, this.y);
            ctx.stroke();

            ctx.fillStyle = this.lightColor.replace('light', 70);
            ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);

            if (this.tick >= this.inflateTime) {
                this.tick = 0;
                this.inflating = false;
            }

        } else {

            this.cx += this.vx;
            this.cy += this.vy += opts.upFlow;

            ctx.fillStyle = this.color;
            ctx.beginPath();
            generateBalloonPath(this.cx, this.cy, this.size);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(this.cx, this.cy);
            ctx.lineTo(this.cx, this.cy + this.size);
            ctx.stroke();

            ctx.fillStyle = this.lightColor.replace('light', 70);
            ctx.fillText(this.char, this.cx + this.dx, this.cy + this.dy + this.size);

            if (this.cy + this.size < -hh || this.cx < -hw || this.cy > hw)
                this.phase = 'done';

        }
    }
}

function Shard(x, y, vx, vy, color) {

    var vel = opts.fireworkShardBaseVel + opts.fireworkShardAddedVel * Math.random();

    this.vx = vx * vel;
    this.vy = vy * vel;

    this.x = x;
    this.y = y;

    this.prevPoints = [
        [x, y]
    ];
    this.color = color;

    this.alive = true;

    this.size = opts.fireworkShardBaseSize + opts.fireworkShardAddedSize * Math.random();
}
Shard.prototype.step = function() {

    this.x += this.vx;
    this.y += this.vy += opts.gravity;

    if (this.prevPoints.length > opts.fireworkShardPrevPoints)
        this.prevPoints.shift();

    this.prevPoints.push([this.x, this.y]);

    var lineWidthProportion = this.size / this.prevPoints.length;

    for (var k = 0; k < this.prevPoints.length - 1; ++k) {

        var point = this.prevPoints[k],
            point2 = this.prevPoints[k + 1];

        ctx.strokeStyle = this.color.replace('alp', k / this.prevPoints.length);
        ctx.lineWidth = k * lineWidthProportion;
        ctx.beginPath();
        ctx.moveTo(point[0], point[1]);
        ctx.lineTo(point2[0], point2[1]);
        ctx.stroke();

    }

    if (this.prevPoints[0][1] > hh)
        this.alive = false;
}

function generateBalloonPath(x, y, size) {

    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x - size / 2, y - size / 2,
        x - size / 4, y - size,
        x, y - size);
    ctx.bezierCurveTo(x + size / 4, y - size,
        x + size / 2, y - size / 2,
        x, y);
}

function anim() {

    window.requestAnimationFrame(anim);

    ctx.fillStyle = '#020202';
    ctx.fillRect(0, 0, w, h);

    ctx.translate(hw, hh);

    var done = true;
    for (var l = 0; l < letters.length; ++l) {

        letters[l].step();
        if (letters[l].phase !== 'done')
            done = false;
    }

    ctx.translate(-hw, -hh);

    // if (done)
    //     for (var l = 0; l < letters.length; ++l)
    //         letters[l].reset();
    // if (done) {
    //     cd.classList.add('dis-none');

    // }

}

for (var i = 0; i < opts.strings.length; ++i) {
    for (var j = 0; j < opts.strings[i].length; ++j) {
        letters.push(new Letter(opts.strings[i][j],
            j * opts.charSpacing + opts.charSpacing / 2 - opts.strings[i].length * opts.charSize / 2,
            i * opts.lineHeight + opts.lineHeight / 2 - opts.strings.length * opts.lineHeight / 2));
    }
}

anim();

window.addEventListener('resize', function() {

    w = cd.width = window.innerWidth;
    h = cd.height = window.innerHeight;

    hw = w / 2;
    hh = h / 2;

    ctx.font = opts.charSize + 'px Verdana';
});

//#endregion - end of - canvas#cd

//#region - start of - v2 
// helper functions
const PI2 = Math.PI * 2
const random = (min, max) => Math.random() * (max - min + 1) + min | 0
const timestamp = _ => new Date().getTime()

// container
class Birthday {
    constructor() {
        this.resize()

        // create a lovely place to store the firework
        this.fireworks = []
        this.counter = 0

    }

    resize() {
        this.width = canvas.width = window.innerWidth
        let center = this.width / 2 | 0
        this.spawnA = center - center / 4 | 0
        this.spawnB = center + center / 4 | 0

        this.height = canvas.height = window.innerHeight
        this.spawnC = this.height * .1
        this.spawnD = this.height * .5

    }

    onClick(evt) {
        let x = evt.clientX || evt.touches && evt.touches[0].pageX
        let y = evt.clientY || evt.touches && evt.touches[0].pageY

        let count = random(3, 5)
        for (let i = 0; i < count; i++) this.fireworks.push(new Firework(
            random(this.spawnA, this.spawnB),
            this.height,
            x,
            y,
            random(0, 260),
            random(30, 110)))

        this.counter = -1

    }

    update(delta) {
        ctx2.globalCompositeOperation = 'hard-light'
        ctx2.fillStyle = `rgba(20,20,20,${ 7 * delta })`
        ctx2.fillRect(0, 0, this.width, this.height)

        ctx2.globalCompositeOperation = 'lighter'
        for (let firework of this.fireworks) firework.update(delta)

        // if enough time passed... create new new firework
        this.counter += delta * 3 // each second
        if (this.counter >= 1) {
            this.fireworks.push(new Firework(
                random(this.spawnA, this.spawnB),
                this.height,
                random(0, this.width),
                random(this.spawnC, this.spawnD),
                random(0, 360),
                random(30, 110)))
            this.counter = 0
        }

        // remove the dead fireworks
        if (this.fireworks.length > 1000) this.fireworks = this.fireworks.filter(firework => !firework.dead)

    }
}

class Firework {
    constructor(x, y, targetX, targetY, shade, offsprings) {
        this.dead = false
        this.offsprings = offsprings

        this.x = x
        this.y = y
        this.targetX = targetX
        this.targetY = targetY

        this.shade = shade
        this.history = []
    }
    update(delta) {
        if (this.dead) return

        let xDiff = this.targetX - this.x
        let yDiff = this.targetY - this.y
        if (Math.abs(xDiff) > 3 || Math.abs(yDiff) > 3) { // is still moving
            this.x += xDiff * 2 * delta
            this.y += yDiff * 2 * delta

            this.history.push({
                x: this.x,
                y: this.y
            })

            if (this.history.length > 20) this.history.shift()

        } else {
            if (this.offsprings && !this.madeChilds) {

                let babies = this.offsprings / 2
                for (let i = 0; i < babies; i++) {
                    let targetX = this.x + this.offsprings * Math.cos(PI2 * i / babies) | 0
                    let targetY = this.y + this.offsprings * Math.sin(PI2 * i / babies) | 0

                    birthday.fireworks.push(new Firework(this.x, this.y, targetX, targetY, this.shade, 0))

                }

            }
            this.madeChilds = true
            this.history.shift()
        }

        if (this.history.length === 0) this.dead = true
        else if (this.offsprings) {
            for (let i = 0; this.history.length > i; i++) {
                let point = this.history[i]
                ctx2.beginPath()
                ctx2.fillStyle = 'hsl(' + this.shade + ',100%,' + i + '%)'
                ctx2.arc(point.x, point.y, 1, 0, PI2, false)
                ctx2.fill()
            }
        } else {
            ctx2.beginPath()
            ctx2.fillStyle = 'hsl(' + this.shade + ',100%,50%)'
            ctx2.arc(this.x, this.y, 1, 0, PI2, false)
            ctx2.fill()
        }

    }
}

let canvas = document.getElementById('birthday')
let ctx2 = canvas.getContext('2d')

let then = timestamp()

let birthday = new Birthday
window.onresize = () => birthday.resize()
document.onclick = evt => birthday.onClick(evt)
document.ontouchstart = evt => birthday.onClick(evt);
setTimeout(() => {
    (function loop() {
        requestAnimationFrame(loop)

        let now = timestamp()
        let delta = now - then

        then = now
        birthday.update(delta / 1000)


    })();
}, 13000);
//#endregion - end of - v2