let WIDTH = 800;
let HEIGHT = 600;

class Grid{

    constructor(width, height, gridSize){
        this.width = width;
        this.height = height;
        this.gridSize = gridSize;

        this.init();
    }

    init () {
        this.nCols = Math.ceil(this.width / this.gridSize);
        this.nRows = Math.ceil(this.height / this.gridSize);
    }

    actualPosition(gridPos){
        return new Vec2(gridPos.x * this.gridSize, gridPos.y * this.gridSize);
    }

    draw (ctx) {
        let pos;
        for (let i = 0; i < this.nCols; i++) {
            pos = this.actualPosition(new Vec2(i, 0));
            ctx.beginPath();
            ctx.strokeStyle = "#0000ff";
            ctx.moveTo(pos.x, pos.y);
            ctx.lineTo(pos.x, this.height);    
            ctx.stroke();
            ctx.closePath();     
        }
        for (let i = 0; i < this.nRows; i++) {
            pos = this.actualPosition(new Vec2(0, i));
            ctx.beginPath();
            ctx.strokeStyle = "#0000ff";
            ctx.moveTo(pos.x, pos.y);
            ctx.lineTo(this.width, pos.y);    
            ctx.stroke();
            ctx.closePath();          
        }
    }

}

class Vec2{

    constructor (x, y){
        this.x = x;
        this.y = y;
    }

    static add (a, b) {
        return new Vec2(a.x + b.x, a.y + b.y);
    }

    equals(other) {
        return (this.x == other.x && this.y == other.y);
    }

}

class Node{

    constructor (pos, game) {
        this.position = pos;
        this.oldPosition = null;
        this.next = null;
        this.prev = null;
        this.game = game;
    }

    draw (ctx) {
        ctx.beginPath();
        ctx.fillStyle = "#ffffff";
        let actualPos = this.game.grids.actualPosition(this.position);
        ctx.fillRect(actualPos.x + 1, 1 + actualPos.y, this.game.grids.gridSize - 1, this.game.grids.gridSize - 1);
        ctx.closePath();
    }

    updatePos (position) {
        this.oldPosition = this.position;
        this.position = position;
    }

    update () {
        
    }

    get Pos () {
        return this.position;
    }

    set Pos(pos) {
        this.position = pos;
    }

    get Next () {
        return this.next;
    }

    set Next (next) {
        this.next = next;
    }

    get Prev () {
        return this.prev;
    }

    set Prev (prev) {
        this.prev = prev;
    }

}

class Head extends Node{

    static get UP () {
        return 0;
    }
    
    static get LEFT () {
        return 1;
    }

    static get RIGHT () {
        return 2;
    }

    static get DOWN () {
        return 3;
    }

    constructor (pos, game) {
        super(pos, game);
        this.direction = Head.DOWN;
        this.prev = null;
        this.eyePos = [new Vec2(6, 16) ,new Vec2(18, 16)];
    }

    draw (ctx) {
        super.draw(ctx);
        ctx.beginPath();
        ctx.fillStyle = "#ff0000";
        let actualPos = this.game.grids.actualPosition(this.position);
        ctx.arc(this.eyePos[0].x + actualPos.x + 1, 
                this.eyePos[0].y + actualPos.y + 1, 2, 0, Math.PI * 2, false);

        ctx.arc(this.eyePos[1].x + actualPos.x + 1, 
                this.eyePos[1].y + actualPos.y + 1, 2, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.closePath();
    }

    update () {
        let newPos;
        if(this.direction == Head.UP){
            newPos = Vec2.add(this.position, new Vec2(0, -1));
            if(newPos.y < 0){
                newPos.y = this.game.grids.nRows; 
            }
        }else if(this.direction == Head.DOWN){
            newPos = Vec2.add(this.position, new Vec2(0, 1));
            if(newPos.y >= this.game.grids.nRows){
                newPos.y = 0; 
            }
        }else if(this.direction == Head.RIGHT){
            newPos = Vec2.add(this.position, new Vec2(1, 0));
            if(newPos.x >= this.game.grids.nCols){
                newPos.x = 0; 
            }
        }else if(this.direction == Head.LEFT){
            newPos = Vec2.add(this.position, new Vec2(-1, 0));
            if(newPos.x < 0){
                newPos.x = this.game.grids.nCols; 
            }
        }
        this.updatePos(newPos);
    }

    goUp () {
        if(this.direction != Head.UP && this.direction != Head.DOWN){
            this.direction = Head.UP;
            this.eyePos = [new Vec2(6, 6) ,new Vec2(18, 6)];
            return true;
        }
        return false;
    }

    goDown () {
        if(this.direction != Head.UP && this.direction != Head.DOWN){
            this.direction = Head.DOWN;
            this.eyePos = [new Vec2(6, 16) ,new Vec2(18, 16)];
            return true;
        }
        return false;
    }

    goLeft () {
        if(this.direction != Head.LEFT && this.direction != Head.RIGHT){
            this.direction = Head.LEFT;
            this.eyePos = [new Vec2(6, 6) ,new Vec2(6, 18)];
            return true;
        }
        return false;
    }

    goRight () {
        if(this.direction != Head.LEFT && this.direction != Head.RIGHT){
            this.direction = Head.RIGHT;
            this.eyePos = [new Vec2(16, 6) ,new Vec2(16, 18)];
            return true;
        }
        return false;
    }

}

class Snake{

    constructor (game) {
        this.game = game;
        this.length = 3;
        this.body = [];
        this.head = new Head(new Vec2(this.game.grids.nCols / 2, this.game.grids.nRows / 2), this.game);
        this.time = 0;
        this.changed = false;
        this.hasEatenItself = false;
        this.init();
    }

    init () {
        let nodePos;
        for (let index = 0; index < this.length - 1; index++) {
            nodePos = Vec2.add(new Vec2(0, -(index+1)), this.head.position);
            let node = new Node(nodePos, this.game);
            node.Prev = (index != 0) ? this.body[index - 1] : this.head;
            node.Prev.Next = node;
            this.body.push(node);
        }
    }

    eat () {
        let nodePos = this.body[this.body.length - 1].oldPosition;
        let node = new Node(nodePos, this.game);
        node.Prev = this.body[this.body.length - 1];
        node.Prev.Next = node;
        this.body.push(node);
    }

    draw (ctx) {
        if(this.time >= 0.4 || this.isAlive){
            this.body.forEach(body => {
                body.draw(ctx);
            });
            this.head.draw(ctx);
        }
    }

    input (e) {
        let key = e.keyCode;
        if(key == 38){
            // Go up
            this.changed = this.head.goUp();
        }else if(key == 39){
            // Go Right
            this.changed = this.head.goRight();
        }else if(key == 37){
            // Go Left
            this.changed = this.head.goLeft();
        }else if(key == 40){
            // Go Down
            this.changed = this.head.goDown();
        }
    }

    update (deltaTime) { 
        this.time += deltaTime;
        if((this.time >= 0.5 || this.changed) && this.isAlive){
            this.head.update();

            this.body.forEach(body => {
                body.updatePos(body.Prev.oldPosition);
                if(this.head.Pos.equals(body.Pos)){
                    this.hasEatenItself = true;
                }
            });

            this.time = 0;
            this.changed = false;
        }else if(!this.isAlive && this.time > 0.9){
            this.time = 0;
        }
    }

    get Pos () {
        return this.head.position;
    }

    get isAlive() {
        return !this.hasEatenItself;
    }

}

class Food{

    constructor (game) {
        this.game = game;
        this.position = null;
        this.animator = 0.6;
        this.animatorStep = 0.1;
        this.relocate();
    }

    relocate () {
        this.position = new Vec2(Math.floor(Math.random() * this.game.grids.nCols), Math.floor(Math.random() * this.game.grids.nRows));
    }

    draw (ctx) {
        ctx.beginPath();
        ctx.fillStyle = "#00ff00";
        let actualPos = this.game.grids.actualPosition(this.position);
        ctx.arc(actualPos.x + 12.5, actualPos.y + 12.5, 8 * this.animator, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.closePath();
    }

    update (deltaTime) {
        this.animator += this.animatorStep * deltaTime; 
        if(this.animator >= 1){
            this.animatorStep = -0.1;
        }else if(this.animator <= 0.6){
            this.animatorStep = 0.1;
        }
    }

    get Pos () {
        return this.position;
    }

}


class Game{

    constructor(elm, width, height){
        this.elm = elm;
        this.context = null;
        this.width = width;
        this.height = height;
        this.snake = null;
        this.startTime = null;
        this.grids = null;
        this.food = null;
        this.paused = true;
        this.quit = false;
        this.score = 0;
    }

    init () {
        // Get the canvas
        this.container = document.querySelector(this.elm);
        this.container.classList.add("game-container");
        this.container.style.width = this.width + "px";
        this.container.style.height = this.height + "px";

        let canvas = document.createElement("canvas");
        // Set canvas dimensions
        canvas.width = this.width;
        canvas.height = this.height;
        this.container.appendChild(canvas);
        // Get canvas context
        this.context = canvas.getContext('2d');
        
        this.grids = new Grid(this.width, this.height, 25);

        // Create the snake
        this.snake = new Snake(this);
        this.food = new Food(game);

        document.addEventListener("keyup", (e) => this.input(e));
        this.showMainMenu();
    }

    showMainMenu () {
        this.clear();
        this.grids.draw(this.context);
        this.snake.draw(this.context);

        this.context.beginPath();
        this.context.fillStyle = "rgba(0, 0, 0, 0.6)";
        this.context.fillRect(0, 0, this.width, this.height);
        this.context.closePath();

        let div = document.querySelector(".screen.main-menu");
        if(!div){
            div = document.createElement("div");
            div.classList.add("screen", "main-menu");
            this.container.appendChild(div);

            let content = document.createElement("div");
            content.classList.add("content");
            div.appendChild(content);

            let heading = document.createElement("h1");
            heading.textContent = "JSnake";
            content.appendChild(heading);

            let play_btn = document.createElement("button");
            play_btn.classList.add("game-button", "play");
            play_btn.textContent = "Play";
            play_btn.addEventListener("click", () => {
                div.classList.add("hide");
                this.start();
            });
            content.appendChild(play_btn);

            let help_btn = document.createElement("button");
            help_btn.classList.add("game-button", "fab");
            help_btn.textContent = "?";
            help_btn.addEventListener("click", () => {
                div.classList.add("hide");
                this.showHelp(div);
            });
            div.appendChild(help_btn);
        }else{
            div.classList.remove("hide");
        }
    }

    showHelp (divPrev) {
        let div = document.querySelector(".screen.help");
        if(!div){
            div = document.createElement("div");
            div.classList.add("screen", "help");
            this.container.appendChild(div);

            let p = document.createElement("div");
            p.classList.add("content");
            p.innerHTML = `
            <h1>JSnake</h1>
            <p>JSnake is a classic snake game. The rules are simple: feed the snake the food(green dot), make sure you don't let it eat itself.</p>
            <h4>How to play?</h4>
            <ul>
            <li>Use Up Arrow to Move Up.</li>
            <li>Use Down Arrow to Move Down.</li>
            <li>Use Left Arrow to Move Left.</li>
            <li>Use Right Arrow to Move Right.</li>
            </ul>
            `;
            div.appendChild(p);

            let back_btn = document.createElement("button");
            back_btn.classList.add("game-button");
            back_btn.textContent = "Back";
            back_btn.addEventListener("click", () => {
                this.removeScreen(".help");
                divPrev.classList.remove("hide");
            });
            p.appendChild(back_btn);
        }else{
            div.classList.remove("hide");
        }
    }

    showGameOver () {
        this.context.beginPath();
        this.context.fillStyle = "rgba(0, 0, 0, 0.6)";
        this.context.fillRect(0, 0, this.width, this.height);
        this.context.closePath();

        this.context.beginPath();
        this.context.font = "120px VT323";
        this.context.fillStyle = "#ff0000";
        this.context.textAlign = "center";
        this.context.fillText("GAME OVER", this.width/2, this.height/2 - 50);
        this.context.font = "80px VT323";
        this.context.fillStyle = "#ffffff";
        this.context.textAlign = "center";
        this.context.fillText("You Scored "+this.score, this.width/2, this.height/2 + 20);
        this.context.closePath();

        let div = document.querySelector(".screen.game-over");
        if(!div){
            div = document.createElement("div");
            div.classList.add("screen", "game-over");
            this.container.appendChild(div);

            let content = document.createElement("div");
            content.classList.add("content");
            div.appendChild(content);

            let play_btn = document.createElement("button");
            play_btn.classList.add("game-button", "play");
            play_btn.textContent = "Play Again";
            play_btn.addEventListener("click", () => {
                div.classList.add("hide");
                this.start();
            });
            content.appendChild(play_btn);

            let back_btn = document.createElement("button");
            back_btn.classList.add("game-button");
            back_btn.textContent = "Back";
            back_btn.addEventListener("click", () => {
                this.removeScreen(".game-over");
                this.removeScreen(".game-overlay");
                this.removeScreen(".paused");

                this.paused = true;
                this.quit = true;
                this.showMainMenu();
            });
            content.appendChild(back_btn);
        }else{
            div.classList.remove("hide");
        }
    }

    showGameOverlay () {
        let div = document.querySelector(".screen.paused");
        if(!div){
            div = document.createElement("div");
            div.classList.add("screen", "paused", "hide");
            this.container.appendChild(div);
        }

        let game_overlay = document.querySelector('.screen.game-overlay');
        if(!game_overlay){
            game_overlay = document.createElement("div");
            game_overlay.classList.add("screen", "game-overlay");
            this.container.appendChild(game_overlay);
        }else{
            game_overlay.classList.remove("hide");
        }

        let pause_btn = document.createElement("button");
        pause_btn.classList.add("game-button", "fab", "top");
        pause_btn.textContent = "||";
        pause_btn.addEventListener("click", () => {
            this.paused = true;
            div.classList.remove("hide");
            game_overlay.classList.add("hide");
        });
        game_overlay.appendChild(pause_btn);


        let content = document.createElement("div");
        content.classList.add("content");
        div.appendChild(content);

        let heading = document.createElement("h1");
        heading.textContent = "Paused";
        content.appendChild(heading);

        let play_btn = document.createElement("button");
        play_btn.classList.add("game-button", "play");
        play_btn.textContent = "Play";
        play_btn.addEventListener("click", () => {
            div.classList.add("hide");
            game_overlay.classList.remove("hide");
            this.paused = false;
        });
        content.appendChild(play_btn);

        let back_btn = document.createElement("button");
        back_btn.classList.add("game-button");
        back_btn.textContent = "Go To Main Menu";
        back_btn.addEventListener("click", () => {
            this.removeScreen(".game-over");
            this.removeScreen(".game-overlay");
            this.removeScreen(".paused");
            this.paused = true;
            this.quit = true;
            this.showMainMenu();
        });
        content.appendChild(back_btn);

        let help_btn = document.createElement("button");
        help_btn.classList.add("game-button", "fab");
        help_btn.textContent = "?";
        help_btn.addEventListener("click", () => {
            div.classList.add("hide");
            this.showHelp(div);
        });
        div.appendChild(help_btn);
    }

    removeScreen (scrn_cls) {
        let screen = document.querySelector('.screen'+scrn_cls);
        if(screen){
            screen.classList.add("hide");
            screen.parentNode.removeChild(screen);
        }
    }

    start () {
        this.showGameOverlay();

        this.score = 0;
        // Create the snake
        this.snake = new Snake(this);
        this.food = new Food(game);
        this.paused = false;
        this.quit = false;
        this.startTime = Date.now();

        this.run();
    }

    run () {
        if(!this.paused){
            let currentTime = Date.now();
            let deltaTime = (currentTime - this.startTime) / 1000;
            this.startTime = currentTime;

            this.update(deltaTime);
            this.draw();
        }
        
        if(!this.quit){
            window.requestAnimationFrame(() => {
                this.run();
            });
        }
    }

    clear () {
        this.context.beginPath();
        this.context.fillStyle = "#000000";
        this.context.fillRect(0, 0, this.width, this.height);
        this.context.closePath();
    }

    draw () {
        this.clear();
        this.grids.draw(this.context);
        // Draw world
        this.snake.draw(this.context);
        this.food.draw(this.context);

        if(!this.snake.isAlive){
            this.showGameOver();
        }else{
            this.context.beginPath();
            this.context.font = "40px VT323";
            this.context.fillStyle = "#ffffff";
            this.context.textAlign = "left";
            this.context.fillText("Score: "+this.score, 55, 44);
            this.context.closePath();
        }
    }

    update (deltaTime) {
        this.food.update(deltaTime);
        this.snake.update(deltaTime);

        if(this.snake.Pos.equals(this.food.Pos)){
            this.score += 100;
            this.snake.eat();
            this.food.relocate();
        }
    }

    input (e) {
        // Update world
        this.snake.input(e);
    }

}



let game = new Game("#game", WIDTH, HEIGHT);

window.onload = () => {
    game.init();
};