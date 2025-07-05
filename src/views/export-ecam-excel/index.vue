<template>
  <!-- <div v-loading="loading" class="export-ecam-excel" element-loading-text="正在导出Excel..."> -->
  <div class="export-ecam-excel">
    <!-- <div>
      <h3 style="font-weight: 800; font-size: 18px">导出Excel</h3>
    </div> -->
    <!-- <el-button @click="onExportExcel">导出Excel</el-button> -->
    <!-- <div class="text-info">
      {{ xlsxFilePath }}
    </div> -->
    <el-form ref="ruleFormRef" style="width: 100%; padding: 10px" :model="ruleForm" status-icon label-width="60px">
      <el-form-item label="文件名" prop="fileName">
        <el-input v-model="ruleForm.fileName" disabled />
      </el-form-item>
      <el-form-item label="保存到" prop="saveDir">
        <!-- <el-input v-model.number="ruleForm.saveDir" placeholder="" readonly /> -->
        <el-input v-model="ruleForm.saveDir" disabled>
          <template #append>
            <!-- <el-button type="primary" :icon="FolderOpened" @click="onFolderOpened" /> -->
            <el-button @click="onFolderOpened">
              <el-icon class="el-icon"><FolderOpened :color="'#409EFF'" /></el-icon>
            </el-button>
          </template>
        </el-input>
      </el-form-item>
      <div style="text-align: center">
        <el-button @click="onOpen"> 导出后直接打开 </el-button>
        <el-button type="primary" @click="onExport">导出</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
  export default {
    name: 'ExportEcamExcel',
  }
</script>

<script setup>
  import ExcelJS from 'exceljs'
  import { onMounted, ref, reactive } from 'vue'
  import { dateFormat } from '@/utils/dateTime'

  import {
    base64ToUint8Array,
    readFileBase64,
    saveFileByBase64,
    uint8ArrayToBase64,
    getAppDir,
    getExistingDirectory,
    openLocalFile,
  } from '@/utils/QTMethods'

  import { ecamResultData } from './data.js'

  import { FolderOpened } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'

  const ruleForm = reactive({
    fileName: '',
    saveDir: '',
  })

  const xlsxFilePath = ref('')
  const loading = ref(false)

  const qtData = ref({})

  // const isQt = computed(() => {
  //   return window.qt && window.bridge
  // })

  // eslint-disable-next-line no-unused-vars
  const onExportExcel2 = async () => {
    if (window.qt) {
      var readFilePath = 'localStorageFiles/test.xlsx'
      var saveFilePath = 'localStorageFiles/copy_test.xlsx'
      const base64Data = await readFileBase64(readFilePath)
      const f_uint8Array = base64ToUint8Array(base64Data) // 将返回的二进制数据转换为 Uint8Array
      console.log('f_uint8Array', f_uint8Array)
      const workbook = new ExcelJS.Workbook()
      await workbook.xlsx.load(f_uint8Array)

      const worksheet = workbook.getWorksheet(1) // Assuming you want to work with the first sheet

      // Define your replacement object with actual placeholders
      const replacements = {
        $a1: 'test',
        $a2: 'abc',
      }

      // Iterate through all cells in the worksheet and apply replacements
      worksheet.eachRow({ includeEmpty: true }, function (row) {
        row.eachCell({ includeEmpty: true }, function (cell) {
          if (typeof cell.value === 'string' && replacements[cell.value]) {
            cell.value = replacements[cell.value]
          }
        })
      })
      // Save the modified Excel file
      const modifiedData = await workbook.xlsx.writeBuffer()
      const uint8ArrayData = new Uint8Array(modifiedData) // 转换为 Uint8Array
      const base64Data2 = uint8ArrayToBase64(uint8ArrayData) // 转换为 Base64 字符串

      const result = await saveFileByBase64(base64Data2, saveFilePath)
      xlsxFilePath.value = result.filePath
    }
  }
  // eslint-disable-next-line no-unused-vars
  const generateExcel = async (data, headerText, isOpenFile) => {
    // 创建一个新的工作簿
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Sheet1')

    worksheet.getCell('A1').value = headerText[0] || '' // 项目名称
    worksheet.mergeCells('B1:D1') // 参数值横向合并 3 列
    worksheet.getCell('B1').value = headerText[1] || '' // 参数值
    worksheet.mergeCells('E1:F1') // 单位横向合并 2 列
    worksheet.getCell('E1').value = headerText[2] || '' // 单位

    // 表头样式
    ;['A1', 'B1', 'E1'].forEach((cellRef) => {
      const cell = worksheet.getCell(cellRef)
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
      // cell.fill = {
      //   type: 'pattern',
      //   pattern: 'solid',
      //   fgColor: { argb: '409EFF' }, // 背景色 #409EFF
      // }
      // cell.font = { color: { argb: '000' }, bold: true } // 白色文字加粗
    })

    worksheet.columns = [
      { key: 'project', width: 20 }, // 项目名称
      { key: 'param1', width: 15 }, // 参数1
      { key: 'param2', width: 15 }, // 参数2
      { key: 'param3', width: 15 }, // 参数3
      { key: 'unit1', width: 10 }, // 单位1
      { key: 'unit2', width: 10 }, // 单位2
    ]

    // 添加数据
    data.forEach((row, index) => {
      const rowIndex = index + 2
      // 横向合并整行（例如 A 到 F）
      worksheet.addRow(row)
      if (row.single) {
        worksheet.mergeCells(`A${rowIndex}:F${rowIndex}`)
        const mergedCell = worksheet.getCell(`A${rowIndex}`)
        mergedCell.value = row.project
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' } // 设置文字居中
        mergedCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '409EFF' }, // 浅灰背景
        }
        mergedCell.font = { bold: true, color: { argb: 'FFFFFF' } } // 黑色加粗文字
      }

      if (row.merge1?.length > 0) {
        worksheet.mergeCells(row.merge1.map((item) => `${item}${rowIndex}`).join(':'))
        // 设置 C 列（第三列）文字居中
      } else {
        const cellC = worksheet.getCell(`C${rowIndex}`)
        cellC.alignment = { horizontal: 'center', vertical: 'middle' } // 水平和垂直居中
      }
      if (row.merge2?.length > 0) {
        worksheet.mergeCells(row.merge2.map((item) => `${item}${rowIndex}`).join(':'))
      }
    })

    // 设置下载文件名
    const fileName = `ecam数据${dateFormat(new Date(), 'YYYY_MM_DD HH_mm_ss')}.xlsx`

    // 导出为 Blob 并触发下载
    const buffer = await workbook.xlsx.writeBuffer()
    if (window.qt) {
      // var readFilePath = 'localStorageFiles/test.xlsx'
      // var saveFilePath = `localStorageFiles/camExcelFiles/${fileName}`
      var saveFileFullPath = ruleForm.saveDir + '/' + ruleForm.fileName

      // Save the modified Excel file
      // const modifiedData = await workbook.xlsx.writeBuffer()
      const uint8ArrayData = new Uint8Array(buffer) // 转换为 Uint8Array
      const base64Data2 = uint8ArrayToBase64(uint8ArrayData) // 转换为 Base64 字符串

      const result = await saveFileByBase64(base64Data2, saveFileFullPath)
      // console.log(r)
      loading.value = false
      xlsxFilePath.value = `文件位置: ${result.fullPath}`

      if (isOpenFile) {
        await openLocalFile(saveFileFullPath)
        ElMessage.success('导出成功,正在打开文件...')
      } else {
        ElMessage.success('导出成功')
      }
    } else {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

      // 创建下载链接
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
      window.URL.revokeObjectURL(url) // 清除URL
      loading.value = false
      xlsxFilePath.value = '导出成功'
    }
  }

  // eslint-disable-next-line no-unused-vars
  const onExportExcel = async (isOpenFile) => {
    const { headerTextArray, titleList, projectList } = qtData.value
    const jsonData = titleList
      .map((item, index) => {
        return [
          {
            project: item.title,
            param1: '',
            param2: '',
            param3: '',
            unit1: '',
            unit2: '',
            single: true,
          },
          ...projectList[`m` + index].map((item) => {
            return {
              project: item.label,
              param1: item.valueArr[0],
              param2: item.valueArr[1],
              param3: item.valueArr[2],
              unit1: item.unitArr[0],
              unit2: item.unitArr[1],
              merge1: (() => {
                if (item.valueArr.length === 1) return ['B', 'D']
                if (item.valueArr.length === 2) return ['C', 'D']
                return []
              })(),
              merge2: (() => {
                if (item.unitArr.length === 1) return ['E', 'F']
                return []
              })(),
            }
          }),
        ]
      })
      .flat()

    generateExcel(jsonData, headerTextArray, isOpenFile)
  }

  const initPage = async () => {
    if (window.qt) {
      const qtDataJSON = await window.bridge.getWindowParam('exportEcamExcel')
      qtData.value = JSON.parse(qtDataJSON)
      console.log('qtData', qtData.value)

      const appDir = await getAppDir()
      ruleForm.saveDir = `${appDir}/localStorageFiles/camExcelFiles`
    } else {
      qtData.value = ecamResultData
    }

    ruleForm.fileName = `ecam数据${dateFormat(new Date(), 'YYYY_MM_DD HH_mm_ss')}.xlsx`
    // onExportExcel()
  }

  const onOpen = () => {
    onExportExcel(true)
  }

  const onExport = () => {
    onExportExcel()
  }

  const onFolderOpened = async () => {
    if (window.qt) {
      const dir = await getExistingDirectory(ruleForm.saveDir)
      if (dir) {
        ruleForm.saveDir = dir
      }
    }
  }

  onMounted(() => {
    initPage()
  })
</script>

<style scoped>
  .export-ecam-excel {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    /* background: red; */
  }
  .text-info {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 18px;
    font-weight: 900;
    width: 100%;
    height: 100%;
    color: #409eff;
  }
</style>
