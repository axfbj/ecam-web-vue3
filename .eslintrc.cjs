module.exports = {
  "root": true,
  "extends": [
    "plugin:vue/vue3-recommended",
    "plugin:vue-scoped-css/base",
    "plugin:prettier/recommended",
    "plugin:vue/vue3-essential",
    "eslint:recommended",
    "@vue/eslint-config-prettier/skip-formatting"
  ],
  "env": {
    "browser": true, // 浏览器全局变量
    "node": true, // Node.js全局变量和作用域
    "jest": true, // Jest全局变量
    "es6": true // 启用ES6的特性
  },
  "globals": {
    "defineProps": "readonly", // 将defineProps定义为全局只读
    "defineEmits": "readonly" // 将defineEmits定义为全局只读
  },
  "plugins": [
    "vue", // 使用Vue插件
    "simple-import-sort" // 使用simple-import-sort插件进行导入排序
  ],
  "parserOptions": {
    "sourceType": "module", // 指定来源的类型，是模块
    "ecmaFeatures": {
      "jsx": true // 启用JSX
    }
  },
  "settings": {
    "import/extensions": [".js", ".jsx"] // 为导入语句指定文件扩展名
  },
  "rules": {
    "no-console": "off", // 关闭禁止console规则
    "no-continue": "off", // 关闭禁止continue语句规则
    "no-restricted-syntax": "off", // 关闭限制特定语法规则
    "no-plusplus": "off", // 允许使用++操作符
    "no-param-reassign": "off", // 关闭禁止对函数参数重新赋值规则
    "no-shadow": "off", // 关闭变量声明覆盖外层作用域变量规则
    "guard-for-in": "off", // 关闭需要在for-in循环中有if语句的规则
    "import/extensions": "off", // 关闭导入文件需包含文件后缀规则
    "import/no-unresolved": "off", // 关闭导入路径错误检查
    "import/no-extraneous-dependencies": "off", // 关闭禁止未列在package.json的依赖导入规则
    "import/prefer-default-export": "off", // 关闭优先使用默认导出的规则
    "import/first": "off", // 关闭所有导入语句之前不能有执行代码规则
    "no-unused-vars": [
      "error", // 启用未使用变量错误提示
      {
        "argsIgnorePattern": "^_", // 忽略以下划线开头的参数
        "varsIgnorePattern": "^_" // 忽略以下划线开头的变量
      }
    ],
    "no-use-before-define": "off", // 关闭禁止在声明之前使用变量或函数规则
    "class-methods-use-this": "off", // 关闭类方法必须使用this规则
    "simple-import-sort/imports": "error", // 对导入语句进行排序
    "simple-import-sort/exports": "error" // 对导出语句进行排序
  },
  // "overrides": [
  //   {
  //     "rules": {
  //         "vue/multi-word-component-names": 0 // 关闭组件名必须为多单词规则
  //       }
  //   } 
  // ]
  // "overrides": [
  //   {
  //     "files": ["*.vue"],
  //     "rules": {
  //       "vue/component-name-in-template-casing": [2, "kebab-case"], // 组件名必须是kebab-case
  //       "vue/require-default-prop": 0, // 关闭属性必须有默认值规则
  //       "vue/multi-word-component-names": 0, // 关闭组件名必须为多单词规则
  //       "vue/no-reserved-props": 0, // 关闭禁止使用保留字作为组件属性规则
  //       "vue/no-v-html": 0, // 关闭禁止使用v-html指令规则
  //       "vue-scoped-css/enforce-style-type": ["error", { "allows": ["scoped"] }] // 强制使用scoped样式
  //     }
  //   }
  // ]
}