import { playWooshSound, playWonTune, playLooseTune } from './audio.js'
let selectedCat
const MIN_DURATION = 900
let duration = 2000
let interval = 200
const ANIMATION_DURATION = 125
let lives
let screamed
const template = document.querySelector("template");
// const THRESHOLD = 0.18
const THRESHOLD = 0.01
const sides = ['left', 'top-left', 'top-right', 'right', 'bottom-left', 'bottom-right']
const cats = ['black', 'black', 'black', 'black', 'black', 'white', 'striped', 'spotted', 'red', 'grey', 'grey-striped', 'purple']
let level = 1

const selectRandom = arr => arr[Math.round(Math.random() * (arr.length - 1))]

const showCat = () => {
    catWrapperEl.querySelector('svg')?.classList.remove('in')

    setTimeout(() => {
        if (selectedCat === 'black' && !screamed) {
            lives--
            playLooseTune()
            updatePoints()
        }
        screamed = false

        selectedCat = selectRandom(cats)

        const clone = template.content.cloneNode(true);
        catWrapperEl.classList = selectRandom(sides)
        clone.querySelector('svg').classList = `cat ${selectedCat}`;

        catWrapperEl.innerHTML = '';
        catWrapperEl.appendChild(clone);

        setTimeout(() => {
            catWrapperEl.querySelector('svg').classList.add('in')
            playWooshSound(ANIMATION_DURATION * 2 / 1000)
        }, 10)

        if (lives > 0) {
            setTimeout(showCat, Math.random() * Math.max(MIN_DURATION, duration))
        }
    }, ANIMATION_DURATION + interval)
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
        if (value > THRESHOLD && !screamed) {
            if (selectedCat === 'black') {
                lives++
                playWonTune()
            } else {
                lives--
                playLooseTune()
            }
            updatePoints()

            screamed = true
        }
        window.requestAnimationFrame(onFrame)
    };
    window.requestAnimationFrame(onFrame)
}

const updatePoints = () => {
    if (lives > 0) {
        if (lives === 7) {
            level++
            levelEl.textContent = level
            lives = 3
            interval = Math.max(0, interval - 10)
            duration = Math.max(MIN_DURATION, duration - 100)
        }
        pointsEl.textContent = new Array(lives).fill('🤘').join('')
    } else {
        dialogEl.showModal()
    }
}

const start = () => {
    instructionsEl.hidden = true
    catsEl.hidden = false
    pointsEl.hidden = false
    startBtnEl.hidden = true;

    dialogEl.close()

    lives = 3
    updatePoints()
    listenUser()
    showCat()
}

startBtnEl.addEventListener('click', start)
restartEl.addEventListener('click', start)

const clone = template.content.cloneNode(true);
clone.querySelector('svg').classList = 'cat black';
instructionsEl.appendChild(clone);