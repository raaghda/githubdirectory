//The variable has to be defined in the global scope, in order to be accessed globally
let searchText="";
const repoContainer = document.getElementById("repos");
const userSearchInputBox = document.getElementById("searchUser");
const profileContainer = document.getElementById("profile");

function renderRepo (repo){
    //We create a div element and save it in the variable repoCard
    var repoCard = document.createElement('div');
    //Attribute with a value is given to the div element
    repoCard.setAttribute("class", "card col-sm-12");
    //add card HTML to the div
    repoCard.innerHTML= `<div class="card-body">
    <h5 class="card-title">${repo.name}</h5>
    <p class="card-text">${repo.description}</p>
    <a href="${repo.html_url}" target="_blank" class="btn btn-primary">Go to repo</a>
    </div>`
    //Appends the div to repos
    repoContainer.appendChild(repoCard);
}

function toJson(data){
    if (!data.ok){
        throw Error("The server responded with an error.");
    }
    return data.json();
}

//Creating a tag for loading the repositories
function reposLoaded(responseData){
    repoContainer.innerHTML="<h2>Repositories</h2>";
    //loopes the repos, e.g. if the repos array has four objects, renderRepo will run four times
    responseData.map(renderRepo);
}

function renderFollowers(follower){
    //We create a div element and save it in the variable followersCard
    var followersCard = document.createElement('div');
    //Attribute with a value is given to the div element
    followersCard.setAttribute("class", "favatar");
    //add card HTML to the div
    followersCard.innerHTML= `<img src="${follower.avatar_url}">
  `
    //Appends the div to followers, i.e favatars 
    document.getElementById("follow").appendChild(followersCard);
}

function networkLoaded(network){
    //The favatars will be cleared ..
    document.getElementById("follow").innerHTML="";
    //...then rendered
    network[0].map(renderFollowers);
    network[1].map(renderFollowers);
}
function loadNetwork(){
    const followers = fetch('https://api.github.com/users/'+ searchText +'/followers').then(toJson);
    const following = fetch('https://api.github.com/users/'+ searchText +'/following').then(toJson);
    
    //A promise that the data will be collected from both followers and following before it is sent to network loaded
    Promise.all([followers, following]).then(networkLoaded);
}

//This function will be triggered when the user is loaded and converted toJson. 
function userLoaded(responseData){
    //The data will be filled in the below created HTML section.
    profileContainer.innerHTML=`
        <div class="profileContainer row">
            <div class="avatar col-12 col-xs-4">
                <img src="${responseData.avatar_url}">
            </div>
            <div class="userInfo col-12 col-xs-8">
                <div class="username">${responseData.name}</div>
                <div class="location">${responseData.location}</div>
                <div class="location">${responseData.blog}</div>
                <div class="buttons">
                    <div id="button-1" class="button button-1 label label-primary">My Network ${responseData.followers + responseData.following}</div>
                <a href="${responseData.html_url}" target="_blank" class="label label-info">View Profile</a>

                </div>
                <div id="follow"></div>
            </div>
        </div>
    `;    
    document.getElementById("button-1").addEventListener("click", loadNetwork);

    //Fetch the repos async
    fetch('https://api.github.com/users/'+ searchText +'/repos').then(toJson).then(reposLoaded);
    
    //We add current date to the object
    responseData.cachedDate = new Date().getTime().toString();
    //Saves the info to localstorage, omvandlar från json till text
    localStorage.setItem('cachedProfile', JSON.stringify(responseData));
}

//Error
function displayError(error){
    profileContainer.innerHTML= "Error: User could not be found.";
}

//This function runs every time input value changes 
function onInputChange(e){
    // If the events keycode is 13, i.e the user clicked ENTER, we do the search
    if (e.keyCode==13){
        //The value typed in by the user is assigned to searchText
        searchText=userSearchInputBox.value;
        //if the searchText is not empty
        if (searchText.length > 0){
            profileContainer.innerHTML='<img class="loader" src="images/loader.gif">';
            // If the profile is cached from a previous visit
            if (localStorage.getItem('cachedProfile')){
                //The cached profile is read from the being previously saved. The text is made into Json
                var cachedProfile = JSON.parse(localStorage.getItem('cachedProfile'));
                //If the time span of the cached profile has exceeded 10 seconds, the localstorage will remove the cached profile
                if (new Date().getTime() - cachedProfile.cachedDate > 10000){ 
                    localStorage.removeItem('cachedProfile');
                }else{
                    //If the cached profile is the same as the searchText, the user will be loaded, and nothing else in this function will run  
                     if (cachedProfile.login == searchText){
                        userLoaded(cachedProfile);  
                        return;
                    }   
                }    
            }
            // Fetch will run asyncronised, and when it is done we convert it also asyncronised in the function toJson. And when that is done, we trigger the function userLoaded. If there's a problem the display error will show to the user
           fetch('https://api.github.com/users/'+ searchText).then(toJson).then(userLoaded).catch(displayError);   
        }
    }
}

//The app only listens to the inputchange, i.e when something is typed in the search bar
function runApp(){
    userSearchInputBox.addEventListener("keyup", onInputChange);
}

//When the elements/document are loaded on the page we run the app, otherwise if we do it before, there will be no HTML elements to select and therefore Javascript will crash.
(function() {
    runApp();
})();