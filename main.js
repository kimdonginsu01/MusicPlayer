const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'HT_Player'

const player = $('.player')
const playlist = $('.playlist')
const cd = $('.cd')
const cdWidth = cd.offsetWidth
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const prevBtn = $('.btn-prev')
const nextBtn = $('.btn-next')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Fallin\' all in you',
            singer: 'Shawn Mendes',
            path: './assets/music/song1.mp3',
            image: './assets/img/image1.jpg'
        },
        {
            name: 'Still With You',
            singer: 'Jungkook',
            path: './assets/music/song2.mp3',
            image: './assets/img/image2.jpg'
        },
        {
            name: 'Double Take',
            singer: 'dhruv',
            path: './assets/music/song3.mp3',
            image: './assets/img/image3.jpg'
        },
        {
            name: 'Soft Lips',
            singer: 'BlankCh3ck',
            path: './assets/music/song4.mp3',
            image: './assets/img/image4.jpg'
        },
        {
            name: 'Hearbreak Anniversary',
            singer: 'Giveon',
            path: './assets/music/song5.mp3',
            image: './assets/img/image5.jpg'
        },
        {
            name: 'I.F.L.Y',
            singer: 'Bazzi',
            path: './assets/music/song6.mp3',
            image: './assets/img/image6.jpg'
        }
    ],
    setConfig: function(key, value) {
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb" 
                        style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })
        playlist.innerHTML = htmls.join('')
    },
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },

    handleEvents: function() {
        const _this = this

        // Xu ly cd quay / dung
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ], {
            duration: 10000, //10 secconds
            iterations: Infinity
        })
        cdThumbAnimate.pause();

        // Xu ly khi scroll
        document.onscroll = function() {
            const scrollTop =  window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }
        
        // Xu ly click play
        playBtn.onclick = function() {
            if (_this.isPlaying) {
                audio.pause();

            } else {
                audio.play();
            }
        }

        // Khi song duoc play
        audio.onplay = function() {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }

        // Khi song duoc pause
        audio.onpause = function() {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        // Khi tien do song thay doi
        audio.ontimeupdate = function() {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent
            }
        }

        // Xu ly khi tua song
        progress.onchange = function(e) {
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
        }

        // Xu ly khi next
        nextBtn.onclick = function() {
            if (_this.isRandom) {
            _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // Xu ly khi prev
        prevBtn.onclick = function() {
            if (_this.isRandom) {
            _this.playRandomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // Xu ly bat / tat random
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom
           _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }

        // Xu ly lap lai mot song
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        // Xu ly next song khi audio ended
        audio.onended = function() {
            if (_this.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }

        // Lang nghe hanh vi click vao playlist
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')

            if (songNode || e.target.closest('.option')) {
                // Xu ly khi click vao song
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }

                // Xu ly khi click song option
                if (e.target.closest('.option')) {

                }
            }
        }

    },
    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            })
        }, 300);
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },
    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },
    nextSong: function() {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    prevSong: function() {
        this.currentIndex--
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },
    playRandomSong: function() {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)

        this.currentIndex = newIndex
        this.loadCurrentSong()
    },
        start: function() {
            this.loadConfig()

            this.defineProperties();

            this.handleEvents();

            this.loadCurrentSong();

            this.render();  

            
            randomBtn.classList.toggle('active', this.isRandom)
            repeatBtn.classList.toggle('active', this.isRepeat)
    }
}

app.start();



 