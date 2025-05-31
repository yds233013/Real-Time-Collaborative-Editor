import { useState } from 'react'
import { createEditor, type Descendant, type Element, type BaseEditor } from 'slate'
import { Slate, Editable, withReact, type ReactEditor } from 'slate-react'
import { AppBar, Toolbar, Typography, Container, Paper } from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor
    Element: { type: 'paragraph'; children: CustomText[] }
    Text: CustomText
  }
}

type CustomText = { text: string }

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
})

const initialValue: Descendant[] = [
  {
    type: 'paragraph' as const,
    children: [{ text: 'Start typing here...' }],
  },
]

function App() {
  const [editor] = useState(() => withReact(createEditor()))
  const [value, setValue] = useState(initialValue)

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div style={{ minHeight: '100vh', backgroundColor: '#121212' }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6">
              Real-Time Collaborative Editor
            </Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3,
              minHeight: '70vh',
              backgroundColor: '#1e1e1e'
            }}
          >
            <Slate
              editor={editor}
              initialValue={initialValue}
              onChange={newValue => {
                setValue(newValue)
                // We'll implement real-time sync here
                console.log(newValue)
              }}
            >
              <Editable
                style={{
                  padding: '20px',
                  minHeight: '65vh',
                  color: '#fff',
                }}
                placeholder="Start typing..."
              />
            </Slate>
          </Paper>
        </Container>
      </div>
    </ThemeProvider>
  )
}

export default App
