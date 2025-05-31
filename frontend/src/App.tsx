import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { Box, useMediaQuery, Drawer, AppBar, Toolbar, IconButton, Typography } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import Editor from './components/Editor.tsx'
import { DocumentList } from './components/DocumentList'
import { useState } from 'react'
import type { Document } from './services/DocumentService'

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
})

const DRAWER_WIDTH = 300;

function App() {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const userId = 'demo-user' // In a real app, this would come from authentication
  const isMobile = useMediaQuery(darkTheme.breakpoints.down('sm'))

  const handleDocumentSelect = (document: Document) => {
    setSelectedDocument(document)
    if (isMobile) {
      setMobileOpen(false)
    }
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const documentList = (
    <Box sx={{ width: DRAWER_WIDTH, height: '100%', overflow: 'auto' }}>
      <DocumentList userId={userId} onDocumentSelect={handleDocumentSelect} />
    </Box>
  )

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <AppBar 
          position="fixed" 
          sx={{ 
            zIndex: (theme) => theme.zIndex.drawer + 1,
            display: { sm: 'none' }
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              Document Editor
            </Typography>
          </Toolbar>
        </AppBar>

        <Box
          component="nav"
          sx={{ 
            width: { sm: DRAWER_WIDTH }, 
            flexShrink: { sm: 0 } 
          }}
        >
          {/* Mobile drawer */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile
            }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: DRAWER_WIDTH 
              },
            }}
          >
            {documentList}
          </Drawer>

          {/* Desktop drawer */}
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: DRAWER_WIDTH,
                position: 'relative',
                height: '100%'
              },
            }}
            open
          >
            {documentList}
          </Drawer>
        </Box>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
            mt: { xs: 8, sm: 0 },
            height: '100%',
            overflow: 'auto'
          }}
        >
          {selectedDocument && <Editor documentId={selectedDocument._id} />}
          {!selectedDocument && (
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                height: '100%'
              }}
            >
              <Typography variant="h5" color="text.secondary">
                Select a document to start editing
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default App
