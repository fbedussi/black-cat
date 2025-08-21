import { playWooshSound, playWonTune, playLooseTune, playBeepBeep } from './audio.js'

let selectedCat
const MIN_DURATION = 1200
const ANIMATION_DURATION = 125
const THRESHOLD = 0.22
let duration
let interval
let lives
let screamed
let level
let waitSound = Promise.resolve()

const sides = ['left', 'top-left', 'top-right', 'right', 'bottom-left', 'bottom-right']
const cats = ['black', 'black', 'black', 'black', 'black', 'white', 'striped', 'spotted', 'red', 'grey', 'grey-striped', 'purple']

const selectRandom = arr => arr[Math.round(Math.random() * (arr.length - 1))]

const queue = (duration, fn) => new Promise((res) => { setTimeout(() => res(fn()), duration) })

const showCat = () => {
    catWrapperEl.querySelector('svg')?.classList.remove('in')

    queue(ANIMATION_DURATION + interval, async () => {
        if (selectedCat === 'black' && !screamed) {
            lives--
            await playLooseTune()
            await updatePoints()
        }
        await waitSound
        screamed = false

        selectedCat = selectRandom(cats)

        const clone = template.content.cloneNode(true);
        catWrapperEl.classList = selectRandom(sides)
        clone.querySelector('svg').classList = `cat ${selectedCat}`;

        catWrapperEl.innerHTML = '';
        catWrapperEl.appendChild(clone);

        await queue(10, () => {
            catWrapperEl.querySelector('svg').classList.add('in')
            playWooshSound(ANIMATION_DURATION * 2 / 1000)
        })

        if (lives > 0) {
            queue(Math.max(MIN_DURATION, Math.random() * duration), showCat)
        }
    },)
}

const listenUser = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const audioContext = new AudioContext()
    const mediaStreamAudioSourceNode = audioContext.createMediaStreamSource(stream)
    const analyserNode = audioContext.createAnalyser()
    mediaStreamAudioSourceNode.connect(analyserNode)

    const pcmData = new Float32Array(analyserNode.fftSize)
    const onFrame = () => {
        if (lives <= 0) {
            return
        }

        analyserNode.getFloatTimeDomainData(pcmData)
        let sumSquares = 0.0;
        for (const amplitude of pcmData) { sumSquares += amplitude * amplitude; }
        const value = Math.sqrt(sumSquares / pcmData.length)
        if (value > THRESHOLD && !screamed && document.body.classList.contains('play')) {
            console.log(value)
            if (selectedCat === 'black') {
                lives++
                waitSound = Promise.all([playWonTune(), updatePoints()])
            } else {
                lives--
                waitSound = Promise.all([playLooseTune(), updatePoints()])
            }
            screamed = true
        }
        window.requestAnimationFrame(onFrame)
    };
    window.requestAnimationFrame(onFrame)
}

const announceNextLevel = async () => {
    playBeepBeep()

    document.body.classList = 'introLevel'

    levelAlertEl.innerHTML = `<div class="levelAnnouncement">level ${level}</div>`

    await queue(1000, () => {
        levelAlertEl.querySelector('.levelAnnouncement').classList.add('hinge')
        document.body.classList.add('play')
    })
    await queue(1000, () => {
        showCat()
    })
    await queue(1000, () => {
        document.body.classList.remove('introLevel')
    })
}

const updatePoints = async () => {
    if (lives > 0) {
        if (lives === 7) {
            level++
            levelEl.textContent = level
            lives = 3
            interval = Math.max(0, interval - 10)
            duration = Math.max(MIN_DURATION, duration - 100)
            await announceNextLevel()
        }
    } else {
        dialogEl.showModal()
    }
    pointsEl.textContent = new Array(lives).fill('🤘').join('')
}

const start = () => {
    dialogEl.close()

    duration = 2500
    interval = 250
    lives = 3
    level = 1
    screamed = false

    listenUser()
    updatePoints()
    announceNextLevel()
}

startBtnEl.addEventListener('click', start)
restartEl.addEventListener('click', start)

const clone = template.content.cloneNode(true);
clone.querySelector('svg').classList = 'cat black';
instructionsEl.appendChild(clone);