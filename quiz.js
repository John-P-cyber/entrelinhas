(() => {
    const root = document.querySelector("[data-quiz-root]");
    if (!root) return;

    const questions = [
        {
            text: "Você entra em uma sala e percebe imediatamente que alguma coisa está errada. O que faz primeiro?",
            options: [
                ["Observo o ambiente e tento descobrir exatamente o que mudou.", "m"],
                ["Fico atento ao que estou sentindo antes de tomar qualquer decisão.", "s"],
                ["Me posiciono para agir caso alguma coisa aconteça.", "p"]
            ]
        },
        {
            text: "Um amigo está enfrentando um problema sério e pede sua ajuda. Sua tendência é:",
            options: [
                ["Ficar ao lado dele e tentar perceber o que ele realmente precisa naquele momento.", "s"],
                ["Pensar em uma solução prática e ajudá-lo a colocá-la em ação.", "p"],
                ["Analisar o problema com ele até encontrar uma saída que faça sentido.", "m"]
            ]
        },
        {
            text: "Durante um exercício em Horebe, seu grupo se perde em uma floresta. Qual seria sua contribuição natural?",
            options: [
                ["Manter o grupo em movimento e garantir que ninguém fique para trás.", "p"],
                ["Procurar pistas, lembrar do caminho e organizar as informações disponíveis.", "m"],
                ["Prestar atenção ao ambiente e dizer quando um caminho simplesmente parece errado.", "s"]
            ]
        },
        {
            text: "Qual dessas situações mais incomoda você?",
            options: [
                ["Saber que algo está errado, mas não conseguir explicar por quê.", "s"],
                ["Saber exatamente o que precisa ser feito e não conseguir agir.", "p"],
                ["Ter informações demais e ainda assim não conseguir compreender o que está acontecendo.", "m"]
            ]
        },
        {
            text: "Você recebe uma ordem de alguém que respeita, mas acredita que ela está errada. O que tende a fazer?",
            options: [
                ["Questiono e tento entender a lógica por trás da decisão.", "m"],
                ["Avalio o que minha consciência está dizendo antes de obedecer.", "s"],
                ["Se houver alguém em perigo, ajo primeiro e resolvo a discussão depois.", "p"]
            ]
        },
        {
            text: "Qual dessas qualidades você mais admira?",
            options: [
                ["Perseverança.", "p"],
                ["Discernimento.", "s"],
                ["Sabedoria.", "m"]
            ]
        },
        {
            text: "Uma criatura desconhecida aparece diante de você. Você não sabe se ela é hostil. Sua primeira reação seria:",
            options: [
                ["Observar seu comportamento e procurar padrões antes de fazer qualquer coisa.", "m"],
                ["Me preparar fisicamente para reagir se ela atacar.", "p"],
                ["Tentar perceber a intenção dela antes de julgá-la apenas pela aparência.", "s"]
            ]
        },
        {
            text: "Durante uma discussão entre seus amigos, você costuma ser a pessoa que:",
            options: [
                ["Tenta perceber o que cada um está sentindo e diminuir a tensão.", "s"],
                ["Intervém quando percebe que a situação está saindo do controle.", "p"],
                ["Organiza os fatos e tenta mostrar onde o conflito realmente começou.", "m"]
            ]
        },
        {
            text: "Qual dessas frases mais combina com você?",
            options: [
                ["“Se eu compreender o problema, consigo encontrar uma saída.”", "m"],
                ["“Há coisas que eu não consigo provar, mas ainda consigo perceber.”", "s"],
                ["“Às vezes você só descobre se consegue depois que tenta.”", "p"]
            ]
        },
        {
            text: "Você encontra uma porta escondida em Horebe que não aparece em nenhum mapa. O que faz?",
            options: [
                ["Procuro marcas, mecanismos ou registros que expliquem por que aquela porta existe.", "m"],
                ["Tento abrir — com cuidado, mas tento.", "p"],
                ["Antes de tocar nela, tento perceber se há alguma coisa estranha do outro lado.", "s"]
            ]
        },
        {
            text: "Você falhou em algo muito importante. Qual costuma ser sua reação?",
            options: [
                ["Tento entender o que fiz de errado para não repetir.", "m"],
                ["Preciso de um tempo para processar o que aquilo significa para mim antes de continuar.", "s"],
                ["Quero tentar novamente o mais rápido possível.", "p"]
            ]
        },
        {
            text: "Você sabe que uma situação difícil está chegando e tem apenas algumas horas para se preparar. Onde concentra seus esforços?",
            options: [
                ["Em estar pronto para suportar o que vier e proteger quem estiver comigo.", "p"],
                ["Em reunir informações e criar diferentes planos para o que pode acontecer.", "m"],
                ["Em me preparar interiormente e ter certeza de que não vou perder de vista aquilo em que acredito.", "s"]
            ]
        }
    ];

    const results = {
        p: {
            name: "Aspecto Físico",
            mark: "F",
            lead: "Você tende a enfrentar problemas através da ação, da disciplina e da resistência. Quando as coisas ficam difíceis, sua primeira preocupação costuma ser: “O que eu posso fazer?”",
            detail: "Isso não significa agir sem pensar. O Aspecto Físico representa presença, coragem e disposição para suportar aquilo que outros talvez não consigam.",
            strengths: "Perseverança, coragem, ação, resistência e proteção.",
            risk: "Acreditar que precisa carregar tudo sozinho ou que pedir ajuda significa fraqueza.",
            quote: "Em Horebe, você aprenderia que força não é apenas quanto peso consegue carregar — mas também saber quando dividi-lo."
        },
        m: {
            name: "Aspecto Mental",
            mark: "M",
            lead: "Você busca compreender antes de agir. Observa detalhes, encontra padrões e provavelmente percebe conexões que passam despercebidas para outras pessoas.",
            detail: "Para você, conhecimento não é apenas curiosidade. É uma ferramenta.",
            strengths: "Estratégia, análise, percepção, planejamento e aprendizado.",
            risk: "Tentar compreender tanto uma situação que acaba adiando decisões ou acreditar que tudo possui uma explicação racional imediata.",
            quote: "Em Horebe, você aprenderia que conhecer todas as possibilidades não significa controlar todas elas."
        },
        s: {
            name: "Aspecto Espiritual",
            mark: "E",
            lead: "Você tende a perceber aquilo que não é imediatamente visível. Emoções, intenções, ambientes e convicções podem falar tão alto para você quanto fatos concretos.",
            detail: "Seu maior recurso é o discernimento.",
            strengths: "Sensibilidade, fé, empatia, discernimento e conexão.",
            risk: "Confundir aquilo que sente com aquilo que é verdadeiro — ou carregar emocionalmente coisas que não pertencem a você.",
            quote: "Em Horebe, você aprenderia que fé não significa acreditar em qualquer sensação. Significa aprender a reconhecer em quem confiar."
        }
    };

    const intro = root.querySelector("[data-quiz-intro]");
    const game = root.querySelector("[data-quiz-game]");
    const result = root.querySelector("[data-quiz-result]");
    const startButton = root.querySelector("[data-quiz-start]");
    const backButton = root.querySelector("[data-quiz-back]");
    const nextButton = root.querySelector("[data-quiz-next]");
    const restartButton = root.querySelector("[data-quiz-restart]");
    const step = root.querySelector("[data-quiz-step]");
    const progressLabel = root.querySelector("[data-quiz-progress-label]");
    const progress = root.querySelector("[data-quiz-progress]");
    const progressBar = root.querySelector("[data-quiz-progress-bar]");
    const number = root.querySelector("[data-quiz-number]");
    const questionHeading = root.querySelector("[data-quiz-question]");
    const options = root.querySelector("[data-quiz-options]");
    const announcer = root.querySelector("[data-quiz-announcer]");

    const resultMark = root.querySelector("[data-result-mark]");
    const resultTitle = root.querySelector("[data-result-title]");
    const resultLead = root.querySelector("[data-result-lead]");
    const resultDetail = root.querySelector("[data-result-detail]");
    const resultStrengths = root.querySelector("[data-result-strengths]");
    const resultRisk = root.querySelector("[data-result-risk]");
    const resultQuote = root.querySelector("[data-result-quote]");

    let current = 0;
    let answers = Array(questions.length).fill(null);

    function renderQuestion(shouldFocus = true) {
        const item = questions[current];
        const percent = Math.round(((current + 1) / questions.length) * 100);

        step.textContent = `Pergunta ${current + 1} de ${questions.length}`;
        progressLabel.textContent = `${percent}% concluído`;
        progress.setAttribute("aria-valuenow", String(current + 1));
        progressBar.style.width = `${percent}%`;
        number.textContent = String(current + 1).padStart(2, "0");
        questionHeading.textContent = item.text;
        options.replaceChildren();

        item.options.forEach(([label], optionIndex) => {
            const button = document.createElement("button");
            const letter = document.createElement("span");
            const copy = document.createElement("span");
            const selected = answers[current] === optionIndex;

            button.type = "button";
            button.className = "quiz-option";
            button.dataset.optionIndex = String(optionIndex);
            button.setAttribute("aria-pressed", String(selected));
            if (selected) button.classList.add("is-selected");

            letter.className = "quiz-option-letter";
            letter.textContent = String.fromCharCode(65 + optionIndex);
            copy.className = "quiz-option-copy";
            copy.textContent = label;

            button.append(letter, copy);
            button.addEventListener("click", () => selectAnswer(optionIndex));
            options.append(button);
        });

        backButton.disabled = current === 0;
        nextButton.disabled = answers[current] === null;
        nextButton.textContent = current === questions.length - 1 ? "Ver meu Aspecto" : "Próxima";

        if (shouldFocus) questionHeading.focus({ preventScroll: true });
    }

    function selectAnswer(optionIndex) {
        answers[current] = optionIndex;
        options.querySelectorAll(".quiz-option").forEach((button, index) => {
            const selected = index === optionIndex;
            button.classList.toggle("is-selected", selected);
            button.setAttribute("aria-pressed", String(selected));
        });
        nextButton.disabled = false;
        announcer.textContent = `Alternativa ${String.fromCharCode(65 + optionIndex)} selecionada.`;
    }

    function leadersFor(scores) {
        const highest = Math.max(...Object.values(scores));
        return Object.keys(scores).filter((key) => scores[key] === highest);
    }

    function calculateResult() {
        const scores = { p: 0, m: 0, s: 0 };

        answers.forEach((answer, index) => {
            scores[questions[index].options[answer][1]] += 1;
        });

        let leaders = leadersFor(scores);
        if (leaders.length === 1) return leaders[0];

        const weightedScores = { ...scores };
        [3, 8, 11].forEach((index) => {
            weightedScores[questions[index].options[answers[index]][1]] += 1;
        });

        leaders = leadersFor(weightedScores);
        if (leaders.length === 1) return leaders[0];

        return questions[11].options[answers[11]][1];
    }

    function showResult() {
        const key = calculateResult();
        const content = results[key];

        game.hidden = true;
        result.hidden = false;
        result.dataset.aspect = key;
        resultMark.textContent = content.mark;
        resultTitle.textContent = content.name;
        resultLead.textContent = content.lead;
        resultDetail.textContent = content.detail;
        resultStrengths.textContent = content.strengths;
        resultRisk.textContent = content.risk;
        resultQuote.textContent = `“${content.quote}”`;
        resultTitle.focus({ preventScroll: true });
        root.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function startQuiz() {
        intro.hidden = true;
        result.hidden = true;
        game.hidden = false;
        renderQuestion(false);
        questionHeading.focus({ preventScroll: true });
        root.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    startButton.addEventListener("click", startQuiz);

    backButton.addEventListener("click", () => {
        if (current === 0) return;
        current -= 1;
        renderQuestion();
    });

    nextButton.addEventListener("click", () => {
        if (answers[current] === null) return;
        if (current === questions.length - 1) {
            showResult();
            return;
        }
        current += 1;
        renderQuestion();
    });

    restartButton.addEventListener("click", () => {
        current = 0;
        answers = Array(questions.length).fill(null);
        result.hidden = true;
        game.hidden = false;
        renderQuestion(false);
        questionHeading.focus({ preventScroll: true });
        root.scrollIntoView({ behavior: "smooth", block: "start" });
    });
})();
