///// LES VARIABLES DU QUIZ

// Audio
let audio = {
    bonne: new Audio('son/bonneReponse.mp3'),
    mauvaise: new Audio('son/mauvaiseReponse.mp3'),

}
let noQuestion = 0;
// Barre d'avancement du quiz
let barreAvancement = document.querySelector(".barre-avancement");
// Largeur de la barre à tout moment (initialement 0)
let largeurBarre = 0;
// Cible de largeur pour chaque étape d'avancement du quiz (calculée selon
// la progression dans les questions et le nombre total de questions)
let largeurCibleBarre = 0;

//Point total
let pointTotal = 0;

// Titre animé du quiz intro
let titreIntro = document.querySelector(".titre-intro");

// Variable pour contenir un nombre aléatoire qui sera generer à chaque afficherQuestion
let indexAleatoire;

// Partie du quiz
let partieQuiz = document.querySelector(".quiz");

// Partie fin du quiz 
let partieFin = document.querySelector(".fin");

// Section contenant une question du quiz et sa position sur l'axe des X
let sectionQuestion = document.querySelector(".quiz section");
let positionY = 100;

// Conteneurs des titres des questions et des choix de réponse
let titreQuestion = document.querySelector(".titre-question");
let lesChoixDeReponses = document.querySelector(".choix-de-reponse");

// Bouton servant à recommencer le quiz
let btnRecommencer = document.querySelector('main.fin .btn-recommencer');
// La section pour ajouter le pointage final
let sectionResultat;
// Tableau vide pour les questions
let questionEnlever = [];
// Le bouton pour changer de mode
let btnMode = document.querySelector('.btn-changer-mode');
// Selectionne le body
let body = document.querySelector('body');
///// ÉVÉNEMENTS 
titreIntro.addEventListener("animationend", afficherConsigne);

// Gestion du bouton de redémarrage du quiz (à la fin du quiz)
btnRecommencer.addEventListener('click', recommencer);

btnMode.addEventListener('click',changerMode);
///// LES FONCTIONS


// Afficher les consignes pour commencer le quiz

//Affiche les consignes quand l'animation de monter-texte arrive
function afficherConsigne(event) {
    if (event.animationName == "monter-texte") {

        let piedPageIntro = document.querySelector("footer");
        piedPageIntro.innerHTML = "<h1>Cliquer pour commencer le quiz</h1>"

        window.addEventListener("click", commencerQuiz);
    }
}
// Commence le quiz apres avoir cliquer sur le window
function commencerQuiz() {
    document.querySelector("main.intro").remove();

    window.removeEventListener("click", commencerQuiz);

    partieQuiz.style.display = "flex";

    afficherQuestion();

}

function afficherQuestion() {


    // Récupérer l'objet de la question en cours dans le tableau des questions
    indexAleatoire = Math.floor(Math.random() * questions.length);

    let objetQuestion = questions[indexAleatoire];

    // Affecter le texte dans le titre de la question
    titreQuestion.innerText = objetQuestion.titre;

    // Créer et afficher les balises des choix de réponse :
    // On commence par vider le conteneur des choix de réponses.
    lesChoixDeReponses.innerHTML = "";

    let unChoix;
    for (let i = 0; i < objetQuestion.choix.length; i++) {
        //On crée la balise et on y affecte une classe CSS
        unChoix = document.createElement("div");
        unChoix.classList.add("choix");
        //On intègre la valeur du choix de réponse
        unChoix.innerText = objetQuestion.choix[i];

        //On affecte dynamiquement l'index de chaque choix
        unChoix.index = i;

        //On met un écouteur pour vérifier la réponse choisie
        unChoix.addEventListener("click", verifierReponse);

        //Enfin on affiche ce choix
        lesChoixDeReponses.append(unChoix);
    }
    //push la question qui va être enlever dans le tableau
    questionEnlever.push(questions[indexAleatoire]);
    // PositionY à 100 à chaque fois
    positionY = 100;

    //Partir la première requête pour l'animation de la section
    requestAnimationFrame(animerSection);

    // Donner le nombre de question restante
    largeurCibleBarre = (noQuestion + 1) / 5 * 100;
    // Appele l'animation de barre Avancement
    requestAnimationFrame(animerBarreAvancement);
    //  + 1 a la question
    noQuestion++;
}
function animerSection() {
    //On décrémente la position de 2 (vw)
    positionY -= 3;
    sectionQuestion.style.transform = `translateY(${positionY}vw)`;

    //On part une autre requête  d'animation si la position n'est pas atteinte
    if (positionY > 0) {
        requestAnimationFrame(animerSection);
    }
}
// Anime la bar jusqua la limite de la largueurCibleBarre
function animerBarreAvancement() {

    largeurBarre += 1;
    barreAvancement.style.width = `${largeurBarre}%`;


    if (largeurBarre < largeurCibleBarre) {
        requestAnimationFrame(animerBarreAvancement);
    }

}
//Vérifie si la réponse est bonne si oui donne 1 point a pointageTotal, joue un son et ajoute la classe bonneReponse
//sinon joue uyn son et ajoute la class mauvaise-reponse
//puis enleve la question qui vient de mit du tableau questions
//enfin attend que l'animation de bonne-reponse ou mauvaise-reponse pour appeler gererProchaineQuestion
function verifierReponse(event) {
    lesChoixDeReponses.classList.toggle('desactiver');

    if (event.target.index == questions[indexAleatoire].bonneReponse) {
        pointTotal++;
        audio.bonne.play();
        event.target.classList.add('bonne-reponse');
    }else{
        audio.mauvaise.play();
        event.target.classList.add('mauvaise-reponse');
    }

    questions.splice(indexAleatoire, 1);
    event.target.addEventListener('animationend',gererProchaineQuestion);
}
// S'il y a encore des questions dans le tableau questions affiche afficherQuestions
// sinon afficherFinQuiz
function gererProchaineQuestion(event) {

    if (questions.length > 0) {
        afficherQuestion();
    } else {
        afficherFinQuiz();
    }

}

function afficherFinQuiz() {
    //Enleve la partieQuiz
    partieQuiz.style.display = "none";
    // Affiche la partieFin
    partieFin.style.display = "flex";
    // Créer et ajoute de dans le pointageTotal et ajoute dans main.fin
    sectionResultat = document.createElement('div');
    sectionResultat.innerText = `Votre score ${pointTotal}/5`;

    document.querySelector("main.fin").append(sectionResultat);

    // Ajouter le score obtenu au localStorage
    ajouterScore(pointTotal);

    // Afficher les meilleurs scores
    afficherScores();

}
function ajouterScore(score) {
    // Vérifier si le localStorage contient déjà des scores
    let scores = JSON.parse(localStorage.getItem('scores')) || [];

    // Ajouter le nouveau score
    scores.push(score);

    // Trier les scores par ordre décroissant
    scores.sort((a, b) => b - a);

    // Garder uniquement les 5 meilleurs scores
    scores = scores.slice(0, 5);

    // Sauvegarder les scores dans le localStorage
    localStorage.setItem('scores', JSON.stringify(scores));
}
function afficherScores() {
    animerSectionFin();
    // Récupérer les scores du localStorage
    let scores = JSON.parse(localStorage.getItem('scores')) || [];

    // Vérifier s'il y a des scores à afficher
    if (scores.length > 0) {
        let tableauScore = document.querySelector('.scoreBoard');
        tableauScore.innerHTML = '';

        // Créer une liste ordonnée pour afficher les scores
        let listeScores = document.createElement('ul');

        let nomTableau = document.createElement('li');
        nomTableau.innerText = "Tableau de Score";
        listeScores.append(nomTableau);
        // Parcourir les scores et créer un élément de liste pour chaque score
        for (let i = 0; i < scores.length; i++) {
            let scoreItem = document.createElement('li');
            scoreItem.innerText = scores[i];
            listeScores.append(scoreItem);
        }

        // Ajouter la liste des scores à l'élément avec la classe "scoreBoard"
        tableauScore.prepend(listeScores);
    }
}
function recommencer() {
    // Ajouter les objets du tableau questionEnlever dans le tableau questions
    questions.push(...questionEnlever);

    // Remet à 0 
    noQuestion = 0;
    largeurBarre = 0;
    largeurCibleBarre = 0;
    pointTotal = 0;
    // Vider le tableau questionEnlever
    questionEnlever = [];

    // Enlever sectionResultat de la page
    sectionResultat.remove();

    // Afficher la partie du quiz
    partieQuiz.style.display = "flex";

    // Cacher la partie fin
    partieFin.style.display = "none";

    partieFin.classList.remove('active');
    // Afficher une nouvelle question
    afficherQuestion();
}
// anime la partie fin 
function animerSectionFin(){
    partieFin.classList.add('active');
}
// Change de mode en Nuit ou Jours
function changerMode() {
    if (btnMode.textContent === 'light_mode') {
        btnMode.textContent = 'dark_mode';
        btnMode.classList.remove('light-mode');
        btnMode.classList.add('dark-mode');
        body.classList.add('active');
        titreQuestion.classList.add('dark-mode');
    } else {
        btnMode.textContent = 'light_mode';
        btnMode.classList.remove('dark-mode');
        btnMode.classList.add('light-mode');
        body.classList.remove('active');
        titreQuestion.classList.remove('dark-mode');
    }
}