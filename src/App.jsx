import {  Dropdown, Table, Select, Segmented, Space, Input, Layout, Tour, theme, message } from 'antd';
import { ColumnWidthOutlined, ColumnHeightOutlined, FieldStringOutlined, FieldNumberOutlined, StopOutlined, GithubOutlined } from '@ant-design/icons';
import { useState, useRef, useEffect } from 'react'
import './App.css'
const { Header, Content } = Layout;

function App() {
  const {
    token: { colorBgContainer },
  } = theme.useToken();  
  
  let [jsonColumns, setJsonColumns] = useState([])

  const [openTour, setOpenTour] = useState(false)
  const [ setTableString] = useState([])
  const [columns, setColumns] = useState([])
  const [data, setData] = useState([])

  const refBody = useRef(null)
  const refGithub =useRef(null)
  const refReverse = useRef(null)
  const refTable = useRef(null)
  const refSave = useRef(null)

  const items = [
    {
      key: 'copy',
      label: '复制',
    },
  ];

  const steps = [
    {
      title: '导入',
      description: '我们可以将excel表格中的部分单元格选中之后在当前页面ctrl+v粘贴',
      target: () => undefined,
    },
    {
      title: '切换',
      description: '如果你的表单对应的纵横有问题，在这里可以切换表头是横向和纵向',
      target: () => refReverse.current,
    },
    {
      title: '配置',
      description: '在这里你可以配置表头，也就是JSON的key',
      target: () => refTable.current,
    },
    {
      title: '保存',
      description: '我们可以保存，复制 JSON 数据',
      target: () => refSave.current,
    },
    {
      title: 'Github',
      description: '点击图标进入 Github 页面',
      target: () => refGithub.current,
    },
  ];
  
  useEffect(() => {
    const isFirst = localStorage.getItem('isFirst') === null
    if (isFirst) {
      setOpenTour(true);
    }
    document.addEventListener('keydown', function(event) {

      if (event.ctrlKey && event.key === 'v' || event.key === 'V') {
        // 检查浏览器是否支持访问剪贴板
        if (navigator.clipboard) {
          // 获取剪贴板中的文本内容
          navigator.clipboard.readText()
            .then(text => {
              message.success('读取成功')
              const [columns, data] = tableString2Array(text, [jsonColumns, setJsonColumns]);
              setTableString(text);
              setColumns(columns);
              setData(data);
            })
            .catch(err => {
              message.success('读取失败', err)
            });
        } else {
          message.success('浏览器不支持访问剪贴板')
        }
      }
    });
  }, []);

  const onTourChange = (current) => {
    if (current === 0) {
      setColumns([]);
      setData([]);
    }
    else if (current !== 0) {
      const tableString = `任务A\t8:30\t9:00\t完成\r\n任务B\t9:00\t10:00\t`
      const [columns, data] = tableString2Array(tableString, [jsonColumns, setJsonColumns]);
      setColumns(columns);
      setData(data);
    } else {
      setColumns([]);
      setData([]);
    }
  }

  const onTourFinish = () => {
    setColumns([]);
    setData([]);
    localStorage.setItem('isFirst', true)
  }

  return (
    <>
      <Layout ref={refBody}>
        <Header style={{ background: colorBgContainer, position: 'sticky', top: 0, zIndex: 1000, display: 'flex', justifyContent: 'space-between' }} >
          <h1>
            <Space>
              Table2JSON
              <a href="https://github.com/7zMonkey/Table2JSON" title='前往github'>
                  <GithubOutlined style={{ color: '#24292f', fontSize: 32}} ref={refGithub}/>
              </a>
            </Space>
          </h1>
          <Space>
            <Segmented
              onChange={() => reverseTable([columns, setColumns], [data, setData], [jsonColumns, setJsonColumns])}
              options={[
                {
                  label: '横向',
                  value: 'List',
                  icon: <ColumnWidthOutlined />
                },
                {
                  label: '纵向',
                  value: '',
                  icon: <ColumnHeightOutlined />
                },
              ]}
              ref={refReverse}
            />
            <div ref={refSave}>
              <Dropdown.Button 
                onClick={() => handleSave(data, jsonColumns)}
                menu={{ items, onClick: () => handleSaveMenu(data, jsonColumns) }}
              >
                保存JSON
              </Dropdown.Button >
            </div>
          </Space>
        </Header>
        <Content style={{ height: "100% - 64px"}}>
            <div ref={refTable}>
              <Table rowKey={'index'} scroll={{ x: '100%', y: 'calc(100vh - 130px)' }} columns={columns} dataSource={data} pagination={false}/>
            </div>
        </Content>
      </Layout>
      <Tour open={openTour} onClose={() => setOpenTour(false)} steps={steps} onChange={onTourChange} onFinish={onTourFinish}/>
    </>
  )
}


function tableString2Array(string, useJsonColumnsState) {
  string = string.replace(/^\s+|\s+$/g, '')
  let jsonColumns = []
  let array = string.split('\r\n').map((item) => (item.split('\t')))
  let columns = new Array(Math.max(...array.map(item => item.length))).fill(0).map((_, index) => {
    jsonColumns[index] = {
      name: 'column-'+index,
      type: 'string'
    }
    return {
    dataIndex: index,
    key: index,
    ellipsis: true,
    width: 200,
    title() {
      return (
        <Input
          key={'input-'+index}
          addonAfter={
            <Select
              defaultValue="string"
              style={{ width: 60 }}
              key={'select-'+index}
              onChange={(e) => handleChange(useJsonColumnsState,index, 'type',e)}
              options={[
                { value: 'number', label: <FieldNumberOutlined />},
                { value: 'string', label: <FieldStringOutlined /> },
                { value: 'not', label: <StopOutlined style={{ color: '#ACACAC'}} /> },
              ]}
            />
          } 
          value={jsonColumns.name}
          defaultValue={'column-'+index}
          onChange={(e) => handleChange(useJsonColumnsState, index, 'name',e.target.value)}
          />
      )
    }
  }})
  return [columns, array]
}

function handleChange (useJsonColumnsState, index, type, value) {
  try {
    const [jsonColumns, setJsonColumns] = useJsonColumnsState
    if (!jsonColumns[index]) {
      jsonColumns[index] = {}
    }
    jsonColumns[index][type] = value
    setJsonColumns(jsonColumns)
  } catch (error) {
    message.error('编辑失败')
  }
}

function handleSave (data, jsonColumns) {
  try {
    const textToCopy = JSON.stringify(data.map((item) => {
      const obj = {}
      jsonColumns.forEach((v, i) => {
        if (v.type !== 'not') {
          try {
            obj[v.name] = v.type === 'number'?Number(item[i]):item[i]
          } catch (error) {
            if (v.type === 'number') {
              message.error('请检查内容格式')
            }
          }
        }
      })
      return obj
    }));
    downloadTextFile(textToCopy, Math.random() + '.json')
    message.success('保存成功')
  } catch (error) {
    message.error('保存失败')
  }
}

function handleSaveMenu (data, jsonColumns) {
  try {
    const textToCopy = JSON.stringify(data.map((item) => {
      const obj = {}
      jsonColumns.forEach((v, i) => {
        if (v.type !== 'not') {
          try {
            obj[v.name] = v.type === 'number'?Number(item[i]):item[i]
          } catch (error) {
            if (v.type === 'number') {
              message.error('请检查内容格式');
            }
          }
        }
      })
      return obj
    }));
    navigator.clipboard.writeText(textToCopy)
    .then(() => {
      message.success("复制成功");
    })
    .catch((error) => {
      message.error("复制失败");
      console.error('复制文本到剪贴板失败:', error);
    });
  } catch (error) {
    message.error("处理失败");
  }
}

function reverseTable (useColumnsState, useDataState, useJsonColumnsState) {
  const [, setColumns] = useColumnsState
  const [data, setData] = useDataState
  const [jsonColumns] = useJsonColumnsState
  let newData = [];

  if (data.length === 0) {
    return
  }
  for (let i = 0; i < Math.max(...data.map(item => item.length)); i++) {
    let temp = [];
    for (let j = 0; j < data.length; j++) {
      temp.push(data[j][i]);
    }
    newData.push(temp);
  }

  setColumns(new Array(Math.max(...newData.map(item => item.length))).fill(0).map((_, index) => ({
    dataIndex: index,
    key: index,
    ellipsis: true,
    width: 200,
    title() {
      return (
        <Input
          key={'input-'+index}
          addonAfter={
            <Select
              defaultValue="string"
              style={{ width: 60 }}
              key={'select-'+index}
              onChange={(e) => handleChange(index, 'type',e.target.value)}
              options={[
                { value: 'number', label: <FieldNumberOutlined />},
                { value: 'string', label: <FieldStringOutlined /> },
                { value: 'not', label: <StopOutlined style={{ color: '#ACACAC'}}/> },
              ]}
            />
          } 
          value={jsonColumns.name}
          defaultValue={'column-'+index}
          onChange={(e) => handleChange(index, 'name',e.target.value)}
          />
      )
    }
  })))

  setData(newData)
}

function downloadTextFile(text, filename) {
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

export default App
