# 使用官方的Node.js镜像作为基础镜像
FROM node:16

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json到工作目录
COPY package*.json ./

# 安装项目依赖
RUN npm install

# 复制所有项目文件到工作目录
COPY . .

# 构建项目
RUN npm run build

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "run", "dev"]
