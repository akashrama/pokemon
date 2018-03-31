/*
Akash Rama- This page has the JavaScript elements for a pokemon game
It allows you to catch them all by battling new pokemon which get added to
your pokedex after a win
*/

/*global fetch*/
"use strict";

(function() {
    
    function $(id){ return document.getElementById(id) }
    // pokemon in pokedex
    let found = ["bulbasaur", "charmander", "squirtle"];
    let chosen = "";
    let guid = "";
    let pid = "";
    
    window.onload = function() {
        
        getPokedex();
        $("start-btn").onclick = battle;
        $("endgame").onclick = reset;
        $("flee-btn").onclick = flee;
        
        let moves = $("my-card").getElementsByTagName("button");
        for (let i = 0; i < $("my-card").querySelectorAll(".move").length; i++) {
            moves[i].onclick = function() {
                movement($("my-card").querySelectorAll(".move")[i].innerHTML);
            }
        }
    }
    
    // needed based on google developers
    function checkStatus(response) {  
        if (response.status >= 200 && response.status < 300) {  
            return response.text();
        } else {  
            return Promise.reject(new Error(response.status+": "+response.statusText)); 
        } 
    }
    
    // populates the pokedex with pictures
    function addImage(response) {
        for (let i = 0; i < $("my-card").querySelectorAll(".move").length; i++) {
            $("my-card").querySelectorAll(".move")[i].parentElement.disabled = true;
        }
        for (let i = 0; i < $("their-card").querySelectorAll(".move").length; i++) {
            $("their-card").querySelectorAll(".move")[i].parentElement.disabled = true;
        }
        let allImages = response.split("\n");
        for (let i = 0; i < allImages.length ; i++) {
            let pos = allImages[i].indexOf(":");
            allImages[i] = allImages[i].slice(pos + 1);
            let img = document.createElement("img");
            img.src = "sprites/" + allImages[i];
            $("pokedex-view").appendChild(img);
            img.classList.add("sprite");
            img.classList.add("unfound");
            let name = allImages[i].slice(0, allImages[i].indexOf("."));
            img.id = name;
        }
        caught();
    }
    
    // ajax call to get all image sources
    function getPokedex(){
        let url = "https://webster.cs.washington.edu/pokedex/pokedex.php";
    
        url += "?";
        url += "pokedex=all";
    
        fetch(url)
           .then(checkStatus)
           .then(addImage)
           .catch(function(error) {
               alert(error);
           });
    }
    
    // updates the pokedex
    function caught() {
        for (let i = 0; i < found.length; i++) {
            let pokemon = $(found[i]);
            pokemon.classList.remove("unfound");
            $(found[i]).onclick = function() {
                populate(found[i]);  
            };
        }
    }
    
    // ajax call to get card info
    function populate(chosen) {
        let url = "https://webster.cs.washington.edu/pokedex/pokedex.php";
        
        url += "?";
        url += "pokemon=";
        url += chosen;
        
        fetch(url)
            .then(checkStatus)
            .then(JSON.parse)
            .then(addInfo)
            .catch(function(error) {
                alert(error);
            });
    }
    
    // your card get fills up
    function addInfo(response) {
        chosen = response.name;
        let card = $("my-card");
        infomize(response, card);
        let buttons = card.getElementsByTagName("button");
        buttons[response.moves.length].classList.remove("hidden");
    }
    
    // puts all pokemon info in
    function infomize(response, card) {
        card.querySelector(".name").innerHTML = response.name;
        
        let img = card.querySelector(".pokepic");
        img.src = response.images.photo;
        
        let strength = card.querySelector(".type");
        strength.src = response.images.typeIcon;
        
        let weakness = card.querySelector(".weakness");
        weakness.src = response.images.weaknessIcon;
        
        card.querySelector(".hp").innerHTML = response.hp + "HP";
        
        card.querySelector(".info").innerHTML = response.info.description;
        
        let moves = card.querySelectorAll(".move");
        let dp = card.querySelectorAll(".dp");
        let image = card.querySelectorAll("button img");
        for (let i = 0; i < moves.length; i++) {
            if (i < response.moves.length) {
                moves[i].innerHTML = response.moves[i].name;
                if (response.moves[i].dp != null) {
                    dp[i].innerHTML = response.moves[i].dp + "DP";
                }
                image[i].src = "icons/" + response.moves[i].type + ".jpg";
            } else {
                moves[i].parentNode.classList.add("hidden");
            }
        }
    }
    
    // set up the battle stage
    function battle() {
        for (let i = 0; i < $("my-card").querySelectorAll(".move").length; i++) {
            $("my-card").querySelectorAll(".move")[i].parentElement.disabled = false;
        }
        $("pokedex-view").classList.add("hidden");
        $("their-card").classList.remove("hidden");
        $("title").innerHTML = "Pokemon Battle Mode";
        $("start-btn").classList.add("hidden");
        $("flee-btn").classList.remove("hidden");
        let card = $("my-card");
        let buffs = card.querySelector(".buffs");
        buffs.classList.remove("hidden");
        card.querySelector(".hp-info").classList.remove("hidden");
        getCard();
    }
    
    // gets a uique opponent
    function getCard() {
        let url = "https://webster.cs.washington.edu/pokedex/game.php";
        
        let data = new FormData();
        
        data.append("startgame", "true");
        data.append("mypokemon", chosen);

        fetch(url, {method: "POST", body: data}) 
            .then(checkStatus)
            .then(JSON.parse)
            .then(opponent)
            .catch(function(error) {
               alert(error);
           });
    }
    
    // populates opponent code with data
    function opponent(response) {
        guid = response.guid;
        pid = response.pid;
        response = response.p2;
        let card = $("their-card");
        infomize(response, card);
    }
    
    // ajax call when a move is called
    function movement(attack) {
        attack = attack.toLowerCase();
        attack = attack.replace(/\s+/g, '');
        
        let url = "https://webster.cs.washington.edu/pokedex/game.php";
        
        let data = new FormData();
        
        data.append("guid", guid);
        data.append("pid", pid);
        data.append("movename", attack);
        
        fetch(url, {method: "POST", body: data})
            .then(checkStatus)
            .then(JSON.parse)
            .then(activate)
            .catch(function(error) {
               alert(error);
           });
    }
    
    // when an attack is taken place the turn updates everything
    function activate(response) {
        $("loading").classList.remove("hidden");
        $("results-container").classList.remove("hidden");
        $("p1-turn-results").classList.remove("hidden");
        $("p2-turn-results").classList.remove("hidden");
        let healthp1 = (response.p1["current-hp"] / response.p1.hp) * 100;
        let healthp2 = (response.p2["current-hp"] / response.p2.hp) * 100;
        $("p1-turn-results").innerHTML = "Player 1 played " + response.results["p1-move"] + " and " + response.results["p1-result"];
        if (healthp2 != 0) {
            $("p2-turn-results").innerHTML = "Player 2 played " + response.results["p2-move"] + " and " + response.results["p2-result"];
        }
        $("my-card").querySelector(".health-bar").style.width = healthp1 + "%";
        $("their-card").querySelector(".health-bar").style.width = healthp2 + "%";
        
        $("my-card").querySelector(".buffs").classList.remove("hidden");
        $("their-card").querySelector(".buffs").classList.remove("hidden");
        
        buffs(response.p1.buffs, "buff", $("my-card"));
        buffs(response.p2.buffs, "buff", $("their-card"));
        buffs(response.p1.debuffs, "debuff", $("my-card"));
        buffs(response.p2.debuffs, "debuff", $("their-card"));
        
        if (healthp1 < 20) {
            $("my-card").querySelector(".health-bar").classList.add("low-health");
        }
        if (healthp2 < 20) {
            $("their-card").querySelector(".health-bar").classList.add("low-health");
        }
        if (healthp1 == 0) {
            $("title").innerHTML = "You lost";
        }
        if (healthp2 == 0) {
            $("title").innerHTML = "You won";
            found.push(response.p2.name.toLowerCase());
            caught();

        }
        if (healthp1 == 0 || healthp2 == 0) {
            $("flee-btn").classList.add("hidden");
            $("endgame").classList.remove("hidden");
            for (let i = 0; i < $("my-card").querySelectorAll(".move").length; i++) {
                $("my-card").querySelectorAll(".move")[i].parentElement.disabled = true;
            }
        }
        
        $("loading").classList.add("hidden");
    }
    
    // sets the buffs for each individual
    function buffs(player, attack, who) {
        if (player.length > 0) {
            let div = document.createElement("div");
            let type = player[player.length-1];
            div.classList.add("buff");
            div.classList.add(type);
            who.querySelector(".buffs").appendChild(div);
        }
    }
    
    // sets the pokedex stage after battle is over
    function reset() {
        $("title").innerHTML = "Your Pokedex"
        $("my-card").querySelector(".health-bar").classList.remove("low-health");
        $("their-card").querySelector(".health-bar").classList.remove("low-health");
        $("my-card").querySelector(".health-bar").style.width = "100%";
        $("their-card").querySelector(".health-bar").style.width = "100%";
        $("results-container").classList.add("hidden");
        $("p1-turn-results").classList.add("hidden");
        $("p2-turn-results").classList.add("hidden");
        $("loading").classList.add("hidden");
        $("endgame").classList.add("hidden");
        $("loading").classList.remove("hidden");
        $("pokedex-view").classList.remove("hidden");
        $("their-card").classList.add("hidden");
        $("my-card").querySelector(".buffs").classList.add("hidden");
        $("my-card").querySelector(".hp-info").classList.add("hidden");
        $("start-btn").classList.remove("hidden");
        $("flee-btn").classList.add("hidden");
        clearbuff($("my-card"))
        clearbuff($("their-card"));
    }
    
    // empties all buffs
    function clearbuff(who) {
        let holder = who.querySelector(".buffs");
        while (holder.firstChild) {
            holder.removeChild(holder.firstChild);
        }
    }
    
    // this sets up the flee button to reset the game
    function flee() {
        let url = "https://webster.cs.washington.edu/pokedex/game.php";
        
        let data = new FormData();
        
        data.append("move", "flee");
        data.append("guid", guid);
        data.append("pid", pid);
        
        fetch(url, {method: "POST", body: data})
            .then(checkStatus)
            .then(JSON.parse)
            .then(run)
            .catch(function(error) {
               alert(error);
           });
    }
    
    // executes the flee
    function run(response) {
        for (let i = 0; i < $("my-card").querySelectorAll(".move").length; i++) {
            $("my-card").querySelectorAll(".move")[i].parentElement.disabled = true;
        }
        $("loading").classList.add("hidden");
        $("results-container").classList.remove("hidden");
        $("title").innerHTML = "You lost";
        $("endgame").classList.remove("hidden");
    }
    
})()
