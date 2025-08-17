let selectedCat = ''
const MIN_DURATION = 900
let duration = 2000
let interval = 200
const ANIMATION_DURATION = 125

const selectRandom = arr => arr[Math.round(Math.random() * (arr.length - 1))]

const showCat = () => {
    catWrapper.querySelector('svg')?.classList.remove('in')
    selectedCat = ''
    setTimeout(() => {
        const cats = ['black', 'black', 'black', 'white', 'striped', 'spotted', 'red', 'grey', 'purple']
        selectedCat = selectRandom(cats)

        const sides = ['left', 'top-left', 'top-right', 'right', 'bottom-left', 'bottom-right']

        const template = document.querySelector("template");
        const clone = template.content.cloneNode(true);
        // catWrapper.style.setProperty("--scale", Math.min(1, Math.random() + 0.5))
        catWrapper.classList = selectRandom(sides)
        clone.querySelector('svg').classList = `cat ${selectedCat}`;
        catWrapper.innerHTML = '';
        catWrapper.appendChild(clone);
        setTimeout(() => {
            catWrapper.querySelector('svg').classList.add('in')
        }, 10)

        duration = duration - 10
        if (Number(points.textContent) >= 0) {
            setTimeout(showCat, Math.random() * Math.max(MIN_DURATION, duration))
        } else {
            dialog.showModal()
        }
    }, ANIMATION_DURATION + interval--)
}

const listenUser = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const audioContext = new AudioContext()
    const mediaStreamAudioSourceNode = audioContext.createMediaStreamSource(stream)
    const analyserNode = audioContext.createAnalyser()
    mediaStreamAudioSourceNode.connect(analyserNode)

    const pcmData = new Float32Array(analyserNode.fftSize)
    const onFrame = () => {
        if (Number(points.textContent) < 0) {
            return
        }

        analyserNode.getFloatTimeDomainData(pcmData)
        let sumSquares = 0.0;
        for (const amplitude of pcmData) { sumSquares += amplitude * amplitude; }
        const value = Math.sqrt(sumSquares / pcmData.length)
        if (value > 0.1) {
            if (selectedCat === 'black') {
                points.textContent = Number(points.textContent) + 1
            } else {
                points.textContent = Number(points.textContent) - 1
            }
        }
        window.requestAnimationFrame(onFrame)
    };
    window.requestAnimationFrame(onFrame)
}

const start = () => {
    instructions.hidden = true
    cats.hidden = false
    points.hidden = false
    startBtn.hidden = true;

    dialog.close()

    points.textContent = 0

    listenUser()
    showCat()
}

startBtn.addEventListener('click', start)

restart.addEventListener('click', start)


const template = document.querySelector("template");
const clone = template.content.cloneNode(true);
clone.querySelector('svg').classList = 'cat black';
instructions.appendChild(clone);