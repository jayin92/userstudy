function prevPage() {
    // Add functionality for previous page
    console.log('Previous page');
    changePage(now)
    now -= 1;
    renderObjects(now);
    resetRadioStatus(now);
}

function nextPage() {
    // Add functionality for next page
    console.log('Next page');
    if (changePage(now)) {
        if (now === data_list.length - 1) {
            MySubmit = form_url;
            MySubmit += `${username_entry}=` + data_list[0]["username"] + "&";

            for (let i = 1; i < data_list.length; i++) {
                for (let q = 1; q <= num_of_questions; q++) {
                    MySubmit += entry_list[i - 1][q - 1] + "=" + data_list[i][`Q${q}`] + "&";
                };
            }

            MySubmit += "submit=Submit";
            window.location.replace(MySubmit);
        } else {
            now += 1;
            renderObjects(now);
            resetRadioStatus(now);
        }

    } else {
        alert("Cannot be empty!!!!");
    }
}

function changePage(now) {
    if (now == 0) {
        username = document.getElementById("username");
        if (username.value == "") {
            return false;
        }
        data_list[0]['username'] = username.value;
        console.log(data_list[0]['username'])
        return true;
    }

    let query_checked = true

    for (let q = 1; q <= num_of_questions; q++) {
        let query = document.querySelector(`input[name="Q${q}"]:checked`);
        if (query == null) {
            query_checked = false;
        } else {
            data_list[now][`Q${q}`] = data_list[now]['data'][parseInt(query.value) - 1]['value']
        }
    }

    return query_checked
}

function resetRadioStatus(now) {
    for (let q = 1; q <= num_of_questions; q++) {
        for (let v = 1; v <= num_of_selection; v++) {
            document.getElementById(`q${q}v${v}`).checked = false;
        }

        for (let v = 1; v <= num_of_selection; v++) {
            if (data_list[now][`Q${q}`] === data_list[now]['data'][v - 1]['value']) {
                document.getElementById(`q${q}v${v}`).checked = true;
                break;
            }
        }
    }
}

function shuffle(array) {
    let currentIndex = array.length;

    while (currentIndex != 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
}

function generateElements(data, width, type) {
    if (type === "video") {
        return `
            <video controls loop muted playsinline>
                <source src="${data}" type="video/mp4" />
            </video>
        `
    }
    else if (type === "image") {
        return `
            <img src="${data}" />
        `
    }
}

function syncVideos() {
    const videos = Array.from(document.querySelectorAll('video'));
    if (videos.length === 0) return;

    let readyCount = 0;

    function checkAndPlay() {
        readyCount++;
        if (readyCount === videos.length) {
            videos.forEach(v => { v.currentTime = 0; });
            Promise.all(videos.map(v => v.play())).catch(() => {});
        }
    }

    videos.forEach(v => {
        if (v.readyState >= 3) {
            checkAndPlay();
        } else {
            v.addEventListener('canplay', checkAndPlay, { once: true });
        }
    });
}

function renderObjects(now) {
    if (now == 0) {
        let txt = `
            <br><br><br><br><br><br>
            <h1>User Study</h1>
            <form style="text-align: center;" align=“center”>
                <fieldset>
                    <legend>Username</legend>
                    <input type="text" id="username" value="">
                </fieldset>
            </form>
        `;
        document.getElementById("images").innerHTML = txt;
    } else {
        let imgs_element = ""
        num_of_selection = data_list[now]['data'].length
        for (let i = 1; i <= num_of_selection; i++) {
            console.log(data_list[now]['data'][i - 1])
            imgs_element += `
                <div class="input-object variant-object">
                    ${generateElements(data_list[now]['data'][i - 1]['url'], 300, element_type)}
                    <div class="titles">${obj_title} ${i}</div>
                </div>
            `
        }

        let input_imgs_element = "";
        const inputs = Array.isArray(data_list[now]['input']) ? data_list[now]['input'] : [data_list[now]['input']];
        for (let i = 0; i < inputs.length; i++) {
            input_imgs_element += `
                <div class="input-object reference-object">
                    ${generateElements(inputs[i], obj_width, "image")}
                    <div class="titles">Satellite Imagery References</div>
                </div>
            `
        }

        let txt = `
            <div>
                <label for="${data_list[now]["name"]}">
                    <div class="video-row">
                        ${input_imgs_element}
                        <div class="input-object reference-object">
                            <video controls loop muted playsinline>
                                <source src="${data_list[now]['ground_truth']}" type="video/mp4" />
                            </video>
                            <div class="titles">${input_title}</div>
                        </div>
                    </div>
                    <br/>
                </label>
                <div class="video-row">
                    ${imgs_element}
                </div>
            </div>
        `;

        document.getElementById("images").innerHTML = txt;
        syncVideos();
        document.getElementById("text_prompt").innerHTML = `Questions`
        renderQuestions();
        document.getElementById("num_page").innerHTML = `${now}/${data_list.length - 1}`;
    }
    if (now == 0) {
        document.getElementById("question").style.visibility = "hidden";
    } else {
        document.getElementById("question").style.visibility = "visible";
    }

    if (now == 0 || now == 1) {
        document.getElementById("prev_button").style.visibility = "hidden";
    } else {
        document.getElementById("prev_button").style.visibility = "visible";
    }

    if (now == data_list.length - 1) {
        document.getElementById("next_button").innerHTML = `SUBMIT`;
    } else {
        document.getElementById("next_button").innerHTML = `NEXT`;
    }
}

function renderQuestions() {
    let txt = ""

    for (let q = 1; q <= num_of_questions; q++) {
        txt += `
        <p>Q${q}. <b>${questions_title[q - 1]}</b>: "${questions[q - 1]}"</p>
        <div>`

        for (let v = 1; v <= num_of_selection; v++) {
            txt += `
                <input type="radio" id="q${q}v${v}" name="Q${q}" value="${v}" class="radio-container"/>
                <label for="q${q}v${v}">${v}</label>
            `
        }

        txt += `
        </div>
        `
        document.getElementById("questions").innerHTML = txt
    }
}