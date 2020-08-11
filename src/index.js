import "babel-polyfill";
import express from "express";
import bodyParser from "body-parser";

import joi from "joi";
import telegram from "node-telegram-bot-api";
import Agent from "socks5-https-client/lib/Agent";

import config from "./config/config";
import log from "./logger";

const app = express();

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// test route
app.get("/test", (req, res) => {
  res.status(200).send({ result: "GET: /test" });
});

app.get("/sendtext", (req, res) => {
  log.info("Send text: ");
  log.info(req.query);

  const dataSchema = joi.object().keys({
    token: joi.string().required(),
    bot: joi.string().required(),
    chatId: joi.number().required(),
    text: joi.string().required()
  });

  const data = req.query;
  const validateResult = joi.validate(data, dataSchema);
  if (validateResult.error) {
    log.error(validateResult.error);
    return res.status(400).send({ result: "validate error" });
  }

  if (data.token != config.token) {
    return res.status(400).send({ result: "Incorrect sec.token!" });
  }

  const bot = new telegram(data.bot, {
    polling: false,
    request: {
      agentClass: Agent,
      agentOptions: {
        socksHost: config.tgproxy_host,
        socksPort: parseInt(config.tgproxy_port),
        // If authorization is needed:
        socksUsername: config.tgproxy_user,
        socksPassword: config.tgproxy_password
      }
    }
  });

  bot
    .sendMessage(data.chatId, data.text)
    .then(data => {
      // console.log(data);
      return res.status(200).send({ result: "ok" });
    })
    .catch(err => {
      log.error(err);
      return res.status(400).send({ result: "Error send message", error: err });
    });
});

app.get("/call", (req, res) => {
  log.info("Skipped call: ");
  log.info(req.query);

  const dataSchema = joi.object().keys({
    token: joi.string().required(),
    bot: joi.string().required(),
    chatId: joi.number().required(),
    phone: joi.string().required(),
    time: joi.string().required(),
    duration: joi.string().required()
  });

  const data = req.query;
  const validateResult = joi.validate(data, dataSchema);
  if (validateResult.error) {
    log.error(validateResult.error);
    return res.status(400).send({ result: "validate error" });
  }

  if (data.token != config.token) {
    return res.status(400).send({ result: "Incorrect sec.token!" });
  }

  // проверяем указан прокси или нет
  let bot = new telegram(data.bot, {
    polling: false,
    request: {
      agentClass: Agent
    }
  });

  if (config.tgproxy_host) {
    bot = new telegram(data.bot, {
      polling: false,
      request: {
        agentClass: Agent,
        agentOptions: {
          socksHost: config.tgproxy_host,
          socksPort: parseInt(config.tgproxy_port),
          // If authorization is needed:
          socksUsername: config.tgproxy_user,
          socksPassword: config.tgproxy_password
        }
      }
    });  
  }


  const text = `Проп.звонок: ${data.phone} (${data.time} / ${data.duration}с.)`;
  bot
    .sendMessage(data.chatId, text)
    .then(data => {
      // console.log(data);
      return res.status(200).send({ result: "ok" });
    })
    .catch(err => {
      log.error(err);
      return res.status(400).send({ result: "Error send message", error: err });
    });
});

app.listen(config.port, () => {
  return console.log(`Server running (port: ${config.port})`);
});
