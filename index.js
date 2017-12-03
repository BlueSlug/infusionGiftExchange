/*
Copyright 2017 Gregor Moss
Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.
You may obtain a copy of the ECL 2.0 License and BSD License at
https://raw.githubusercontent.com/BlueSlug/infusionGiftExchange/master/LICENSE.txt
*/

"use strict";

/* eslint-env node */
var fluid = require("infusion");

require("./src/infusionGiftExchange");

// Register our content so that it can be referenced in other packages using `fluid.module.resolvePath("%infusionGiftExchange/path/to/content")`
fluid.module.register("infusionGiftExchange", __dirname, require);
