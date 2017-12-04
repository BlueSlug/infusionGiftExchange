/*
Copyright 2017 Gregor Moss
Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.
You may obtain a copy of the ECL 2.0 License and BSD License at
https://raw.githubusercontent.com/BlueSlug/infusionGiftExchange/master/LICENCE.txt
*/

"use strict";

var fluid = require("infusion");
require("../../src/infusionGiftExchange.js");

fluid.setLogging(fluid.logLevel.IMPORTANT);

fluid.defaults("fluid.giftExchange.example", {
    gradeNames: ["fluid.giftExchange"],
    giftExchangeOptions: {
        hostAddress: "",
        hostSecure: true,
        hostPort: 465,
        hostAuth: {
            username: "",
            password: ""
        },
        mailerDebug: true,
        mailerLogging: true,
        sender: ""
    },
    participants: [
        {
            name: "Jack Skelington",
            emailAddress: "",
            interests: "cats, dogs, snow"
        },
        {
            name: "Chris Cringle",
            emailAddress: "",
            interests: "cars, bikes, sun"
        },
        {
            name: "Gift Giver",
            emailAddress: "",
            interests: "crosswords, programming, reading"
        }
    ]
});

var giftExchange = fluid.giftExchange.example();
giftExchange.selectAndNotifyParticipants();
