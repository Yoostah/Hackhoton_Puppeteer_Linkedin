const puppeteer = require("puppeteer");
require("dotenv").config();

const BASE_URL = "https://www.linkedin.com";

const linkedin = {
  browser: null,
  page: null,

  initialize: async () => {
    linkedin.browser = await puppeteer.launch({
      headless: false
    });

    linkedin.page = await linkedin.browser.newPage();

    await linkedin.page.goto(BASE_URL, { waitUntil: "networkidle2" });

    await linkedin.page.$eval(".search__placeholder--search", el => el.click());

    await linkedin.page.type('input[name="keywords"]', "Desenvolvedor", {
      delay: 50
    });

    await linkedin.page.evaluate(() => {
      let elements = document.getElementsByClassName("switcher-tabs__button");
      for (let element of elements) console.log(element.nodeValue);
    });

    await linkedin.page.keyboard.press("Tab", { delay: 100 });

    await linkedin.page.keyboard.press("Tab", { delay: 100 });

    // console.log(await linkedin.page.$x('//a[contains(text(), "Vagas")]'))

    //console.log(await linkedin.page.$eval('.switcher-tabs__button', al => al.click()))

    await linkedin.page.type('input[name="location"]', "United States", {
      delay: 50
    });

    //Pesquise vagas
    await linkedin.page.keyboard.press("Tab", { delay: 100 });

    await linkedin.page.keyboard.press("Tab", { delay: 100 });

    await linkedin.page.evaluate(() => {
      let el = document.getElementsByClassName("search__button");
      el[1].click();
    });
  },

  crawl: async (req, res) => {
    linkedin.browser = await puppeteer.launch({
      headless: false
    });

    linkedin.page = await linkedin.browser.newPage();

    await linkedin.page.goto(BASE_URL, { waitUntil: "networkidle2" });

    //Loga no site para fazer a busca das informações

    let seletor = "input[name='session_key']";
    await linkedin.page.waitForSelector(seletor);
    await linkedin.page.type(seletor, process.env.LOGIN, {
      delay: 5
    });

    seletor = "input[name='session_password']";
    await linkedin.page.waitForSelector(seletor);
    await linkedin.page.type(seletor, process.env.PASSWORD, {
      delay: 5
    });

    await linkedin.page.evaluate(() => {
      let el = document.getElementsByClassName("sign-in-form__submit-btn");
      el[0].click();
    });

    //Acessa o perfil que deseja extrair as informações
    await linkedin.page.goto(process.env.CHECK_URL, {
      waitUntil: "networkidle2"
    });

    await linkedin.page.evaluate(() => {
      //Armazena todas as informações do perfil
      var userInfo = [];

      //Informações Gerais
      let name = document.querySelector("h1.topcard__name").textContent;
      userInfo["name"] = name;

      let current_job = document.querySelector("h2.topcard__headline")
        .textContent;
      userInfo["current_job"] = current_job;

      let current_job_location = document.querySelector("h3.topcard__location")
        .textContent;
      userInfo["current_job_location"] = current_job_location;

      let job_industry = document.querySelector("h4.topcard__industry")
        .textContent;
      userInfo["job_industry"] = job_industry;

      let about = document.querySelector("p.summary__description").textContent;
      userInfo["about"] = about;

      //Experiências
      var experiencia = [];

      var elements = document.querySelectorAll(
        "div.section-item__content.position__content"
      );

      for (let i = 0, child; (child = elements[i]); i++) {
        var exp = [];
        exp["role"] = child.querySelector("h4").innerText;
        exp["company"] = child.querySelector("h5").innerText;
        exp["duration"] = child.querySelector("span.date-range").innerText;
        experiencia.push(exp);
      }

      userInfo["experience"] = experiencia;

      //Formação
      var formacao = [];

      var elements = document.querySelectorAll(
        "div.section-item__content.education-item__content"
      );

      for (let i = 0, child; (child = elements[i]); i++) {
        var course = [];
        course["institute"] = child.querySelector("h4").innerText;
        course["course"] = child.querySelector("p").innerText;
        course["duration"] = child.querySelector("span.date-range").innerText;
        formacao.push(course);
      }

      userInfo["graduation"] = formacao;

      //Idiomas
      var idiomas = [];

      var elements = document.querySelectorAll("li.languages__language");

      for (let i = 0, child; (child = elements[i]); i++) {
        var course = [];
        course["language"] = child.querySelector("h4").innerText;
        course["proficiency"] = child.querySelector("p").innerText;
        idiomas.push(course);
      }

      userInfo["languages"] = idiomas;

      //Certificados
      var certificados = [];

      var elements = document.querySelectorAll(
        "div.section-item__content.certification-item__content"
      );

      for (let i = 0, child; (child = elements[i]); i++) {
        var course = [];
        course["course_title"] = child.querySelector(
          "h4.section-item__title.certification-item__title"
        ).innerText;
        course["authority"] = child.querySelector(
          "p.certification-item__certificate-authority-name"
        ).innerText;
        course["valid_until"] = child.querySelector(
          "span.date-range"
        ).innerText;
        certificados.push(course);
      }

      userInfo["certificates"] = certificados;

      console.log(userInfo);
    });
  }
};

module.exports = linkedin;
