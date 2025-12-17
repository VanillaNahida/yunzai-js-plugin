import plugin from "../../lib/plugins/plugin.js";
import fetch from 'node-fetch';
import Yaml from 'yaml'
import _ from 'lodash'
import fs from 'fs'
import path from 'path'

const yaml_url = "https://raw.githubusercontent.com/VanillaNahida/yunzai-js-plugin/refs/heads/main/CalabiYau_text_base64.txt";
const yaml_file_path ="./plugins/example/CalabiYau_text.yml"

async function fetchAndSaveYaml() {
  try {
    logger.info("正在从云端获取最新词库...");
    const response = await fetch(yaml_url);
    if (!response.ok) {
      logger.error(`请求云端词库失败! 错误码: ${response.status}`);
    }
    // Gitee过审核，解密词库
    logger.info("解密词库中...")
    const base64Content = await response.text();
    const yamlContent = Buffer.from(base64Content, 'base64').toString('utf-8');
    logger.info("词库解密完成。")

    try {
      Yaml.parse(yamlContent);
      logger.info("词库格式校验通过。");
    } catch (parseError) {
      logger.error(`从云端获取的词库格式不合法: ${parseError.message}。已丢弃结果。`);
    }
    const savePath = path.join(process.cwd(), yaml_file_path);
    fs.writeFileSync(savePath, yamlContent, 'utf-8');
    logger.info(`保存词库文件成功，已将其保存为 CalabiYau_text.yml`);
    const text_data = Yaml.parse(fs.readFileSync(yaml_file_path, 'utf-8'))
    const calabiyau_text_array = text_data.sentences
    logger.info(`云端词库更新成功！当前词库共 ${calabiyau_text_array.length} 条。`)
    return true;
  } catch (error) {
    logger.error("获取词库文件失败:", error);
    return false;
  }
}

// 加载插件时候初始化词库
fetchAndSaveYaml()

export class CalabiYau_meow extends plugin {
  constructor() {
    super({
      name: "喵言喵语",
      dsc: "喵言喵语",
      event: "message",
      priority: -999,
      rule: [
        {
          reg: "(.*)喵言喵语(.*)",
          fnc: "CalabiYau_meow",
        }
      ],
    });
  }
  
  async CalabiYau_meow(e) {
    const text_data = Yaml.parse(fs.readFileSync(yaml_file_path, 'utf-8'))
    const calabiyau_text_array = text_data.sentences
    let randomIndex = Math.floor(Math.random() * calabiyau_text_array.length);
    let randomtext = calabiyau_text_array[randomIndex];
    e.reply(randomtext, true)
    return true; 
  }
}