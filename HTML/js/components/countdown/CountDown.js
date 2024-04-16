export default class CountDown extends BaseComponent {
	constructor({
		name,
		loadInnerComponents,
		parent,
		element,
		countdownDate = "Dec 31, 2024 15:37:25",
		expiredText = "Concluded"
	}) {
		super({
			name,
			loadInnerComponents,
			parent,
			element,
			defaults: {
				countdownDate,
				expiredText
			}
		});
		this.setup();
		this.init();
	}

	init() {
		this.updateCountdown(); // Actualiza el contador al cargar la página
		this.countDown(); // Inicia el contador regresivo
	}

	updateCountdown() {
		const countDownDate = new Date(this.options.countdownDate).getTime();
		const now = new Date().getTime();
		const distance = countDownDate - now;
		const days = Math.max(Math.floor(distance / (1000 * 60 * 60 * 24)), 0);
		const hours = Math.max(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)), 0);
		const minutes = Math.max(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)), 0);
		const seconds = Math.max(Math.floor((distance % (1000 * 60)) / 1000), 0);

		document.querySelector(".days .number").innerHTML = days;
		document.querySelector(".hours .number").innerHTML = hours;
		document.querySelector(".minutes .number").innerHTML = minutes;
		document.querySelector(".seconds .number").innerHTML = seconds;
	}

	countDown() {
		const countDownDate = new Date(this.options.countdownDate).getTime();
		const expiredText = this.options.expiredText;

		var x = setInterval(() => {
			this.updateCountdown(); // Actualiza los valores del contador
			const now = new Date().getTime();
			const distance = countDownDate - now;

			if (distance < 0) {
				clearInterval(x);
				document.getElementById("countdown").innerHTML = `<h4>${expiredText}</h4>`;
			}
		}, 1000);
	}
}