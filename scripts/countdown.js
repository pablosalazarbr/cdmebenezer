/*
Programa de javascript para la implementación de un contador animado
Idea Original de barclayd
Adaptado para la web CDM por: Ángel Guzmán y Pablo Salzar
*/

const updateTimer = (deadline) => {
    // Calcula el tiempo que falta hasta la fecha límite
    const time = deadline - new Date();
    return {
        'days': Math.floor(time / (1000 * 60 * 60 * 24)),
        'hours': Math.floor((time / (1000 * 60 * 60)) % 24),
        'minutes': Math.floor((time / (1000 * 60)) % 60),
        'seconds': Math.floor((time / (1000)) % 60),
        'total': time
    };
}

const animateClock = (span) => {
    // La animación dura 1 segundo
    span.className = 'turn';
    setTimeout(() => {
        span.className = '';
    }, 1000);
}

const startTimer = (id, deadline) => {
    // Llama la función updateTimer cada segundo
    const timeInterval = setInterval(() => {
        const clock = document.getElementById(id);
        let timer = updateTimer(deadline);

        clock.innerHTML =
            '<span>' + timer.days + '</span>' +
            '<span>' + timer.hours + '</span>' +
            '<span>' + timer.minutes + '</span>' +
            '<span>' + timer.seconds + '</span>';

        const spans = clock.getElementsByTagName("span");
        animateClock(spans[3]);
        if (timer.seconds == 59) animateClock(spans[2]);
        if (timer.minutes == 59 && timer.seconds == 59) animateClock(spans[1]);
        if (timer.minutes == 23 && timer.minutes == 59 && timer.seconds == 59) animateClock(spans[0]);


        // Revisamos si la fecha límite ya pasó
        if (timer.total < 1) {
            clearInterval(timeInterval);
            clock.innerHTML =
                '<span>0</span><span>0</span><span>0</span><span>0</span>';
        }

    }, 1000);
}


window.onload = () => {
    // Configuramos la fecha que deseamos como límite
    const deadline = new Date("December 6, 2019 00:00:00");
    startTimer("clock", deadline)
};
