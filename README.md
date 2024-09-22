# 图片处理工具

这是一个基于Next.js 14开发的多功能图片处理网站。用户可以进行图片格式转换、裁剪、调整大小、压缩、添加滤镜和生成 SVG 等操作。

## 功能

1. 图片格式转换
   - 支持JPG, PNG, GIF, WebP等常见格式
   - 单张或多张图片上传
   - 自由选择目标格式

2. 图片裁剪
   - 自由选择裁剪区域
   - 实时预览裁剪效果

3. 调整图片大小
   - 自定义宽度和高度
   - 保持宽高比选项

4. 图片压缩
   - 调整压缩质量
   - 文件大小预览

5. 图片滤镜
   - 多种滤镜效果选择（灰度、复古、反转等）
   - 实时预览滤镜效果

6. SVG 生成器
   - 输入 SVG 代码
   - 实时预览 SVG 图像
   - 下载为 SVG、PNG 或 JPG 格式

## 使用方法

1. 访问网站首页
2. 选择所需的图片处理功能
3. 上传图片或输入 SVG 代码（对于 SVG 生成器）
4. 进行相应操作
5. 下载处理后的图片

## 技术栈

- Next.js 14
- React
- TypeScript
- Material-UI
- Sharp (用于图片处理)
- Canvas API (用于滤镜效果和图像转换)

## 开发计划

- [x] 实现基础UI组件
- [x] 开发格式转换功能
- [x] 实现图片裁剪功能
- [x] 实现调整大小功能
- [x] 实现图片压缩功能
- [x] 实现滤镜功能
- [x] 实现 SVG 生成器功能
- [ ] 优化移动端体验

## 待优化项目

1. 进一步优化大文件处理性能
2. 添加更多高级图片处理选项
3. 实现用户账户系统，支持保存处理历史
4. 添加更多文件格式支持（如TIFF等）
5. 优化移动端体验
6. 添加批量处理功能
7. 增强 SVG 编辑功能，如添加可视化编辑器
