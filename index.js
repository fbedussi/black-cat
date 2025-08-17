let selectedCat

const showCat = () => {
    const cats = ['black', 'black', 'white', 'red', 'gray']

    const index = Math.round(Math.random() * (cats.length - 1))
    selectedCat = cats[index]
    cat.textContent = selectedCat

    setTimeout(showCat, Math.random() * 1250 + 100)
}

const listenUser = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const audioContext = new AudioContext()
    const mediaStreamAudioSourceNode = audioContext.createMediaStreamSource(stream)
    const analyserNode = audioContext.createAnalyser()
    mediaStreamAudioSourceNode.connect(analyserNode)

    const pcmData = new Float32Array(analyserNode.fftSize)
    const onFrame = () => {
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

const showCat2 = (color) => {
    const template = document.querySelector("template");
    const clone = template.content.cloneNode(true);
    clone.querySelector('svg').classList = `cat ${color}`;
    document.body.appendChild(clone);
}

showCat2('white');
showCat2('black');
showCat2('striped');
showCat2('spotted');
showCat2('red');
showCat2('grey');
showCat2('purple');

const start = () => {
    listenUser()
    showCat()
    startBtn.disabled = true;

}

startBtn.addEventListener('click', start)