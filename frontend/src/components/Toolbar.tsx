import { Box, IconButton, Tooltip, Menu, MenuItem } from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  LooksOne,
  LooksTwo,
  FormatColorText,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatAlignJustify
} from '@mui/icons-material';
import { Editor, Element as SlateElement, Transforms } from 'slate';
import type { BaseEditor } from 'slate';
import type { ReactEditor } from 'slate-react';
import { useState } from 'react';

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor
    Element: {
      type: 'paragraph' | 'heading-one' | 'heading-two' | 'block-quote' | 'numbered-list' | 'bulleted-list' | 'list-item'
      align?: 'left' | 'center' | 'right' | 'justify'
      children: CustomText[]
    }
    Text: CustomText
  }
}

type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
}

type CustomEditor = BaseEditor & ReactEditor;

interface ToolbarProps {
  editor: CustomEditor;
}

type BlockType = 'paragraph' | 'heading-one' | 'heading-two' | 'block-quote' | 'numbered-list' | 'bulleted-list' | 'list-item';
type AlignType = 'left' | 'center' | 'right' | 'justify';

const LIST_TYPES = ['numbered-list', 'bulleted-list'] as const;
const COLORS = ['black', 'red', 'green', 'blue', 'purple', 'orange'] as const;

const Toolbar = ({ editor }: ToolbarProps) => {
  const [colorAnchor, setColorAnchor] = useState<null | HTMLElement>(null);

  const isMarkActive = (format: 'bold' | 'italic' | 'underline' | 'color') => {
    const marks = Editor.marks(editor);
    return marks ? marks[format] === true : false;
  };

  const toggleMark = (format: 'bold' | 'italic' | 'underline') => {
    const isActive = isMarkActive(format);
    if (isActive) {
      Editor.removeMark(editor, format);
    } else {
      Editor.addMark(editor, format, true);
    }
  };

  const setColor = (color: string) => {
    Editor.addMark(editor, 'color', color);
    setColorAnchor(null);
  };

  const isBlockActive = (format: BlockType, align?: AlignType) => {
    const { selection } = editor;
    if (!selection) return false;

    const [match] = Array.from(
      Editor.nodes(editor, {
        at: Editor.unhangRange(editor, selection),
        match: n =>
          !Editor.isEditor(n) && 
          SlateElement.isElement(n) && 
          n.type === format &&
          (!align || n.align === align),
      })
    );

    return !!match;
  };

  const toggleBlock = (format: BlockType) => {
    const isActive = isBlockActive(format);
    const isList = LIST_TYPES.includes(format as typeof LIST_TYPES[number]);

    Transforms.unwrapNodes(editor, {
      match: n =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        LIST_TYPES.includes(n.type as typeof LIST_TYPES[number]),
      split: true,
    });

    Transforms.setNodes(editor, {
      type: isActive ? 'paragraph' : isList ? 'list-item' : format,
    });

    if (!isActive && isList) {
      const block = { type: format, children: [] };
      Transforms.wrapNodes(editor, block);
    }
  };

  const toggleAlign = (align: AlignType) => {
    Transforms.setNodes(
      editor,
      { align },
      { match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n) }
    );
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      gap: 1, 
      p: 1, 
      borderBottom: 1, 
      borderColor: 'divider',
      backgroundColor: '#1e1e1e' 
    }}>
      <Tooltip title="Bold">
        <IconButton 
          onClick={() => toggleMark('bold')}
          color={isMarkActive('bold') ? 'primary' : 'default'}
          size="small"
        >
          <FormatBold />
        </IconButton>
      </Tooltip>

      <Tooltip title="Italic">
        <IconButton 
          onClick={() => toggleMark('italic')}
          color={isMarkActive('italic') ? 'primary' : 'default'}
          size="small"
        >
          <FormatItalic />
        </IconButton>
      </Tooltip>

      <Tooltip title="Underline">
        <IconButton 
          onClick={() => toggleMark('underline')}
          color={isMarkActive('underline') ? 'primary' : 'default'}
          size="small"
        >
          <FormatUnderlined />
        </IconButton>
      </Tooltip>

      <Box sx={{ borderLeft: 1, borderColor: 'divider', mx: 1 }} />

      <Tooltip title="Text Color">
        <IconButton 
          onClick={(e) => setColorAnchor(e.currentTarget)}
          size="small"
        >
          <FormatColorText />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={colorAnchor}
        open={Boolean(colorAnchor)}
        onClose={() => setColorAnchor(null)}
      >
        {COLORS.map((color) => (
          <MenuItem 
            key={color}
            onClick={() => setColor(color)}
            sx={{ color }}
          >
            {color.charAt(0).toUpperCase() + color.slice(1)}
          </MenuItem>
        ))}
      </Menu>

      <Box sx={{ borderLeft: 1, borderColor: 'divider', mx: 1 }} />

      <Tooltip title="Align Left">
        <IconButton 
          onClick={() => toggleAlign('left')}
          color={isBlockActive('paragraph', 'left') ? 'primary' : 'default'}
          size="small"
        >
          <FormatAlignLeft />
        </IconButton>
      </Tooltip>

      <Tooltip title="Align Center">
        <IconButton 
          onClick={() => toggleAlign('center')}
          color={isBlockActive('paragraph', 'center') ? 'primary' : 'default'}
          size="small"
        >
          <FormatAlignCenter />
        </IconButton>
      </Tooltip>

      <Tooltip title="Align Right">
        <IconButton 
          onClick={() => toggleAlign('right')}
          color={isBlockActive('paragraph', 'right') ? 'primary' : 'default'}
          size="small"
        >
          <FormatAlignRight />
        </IconButton>
      </Tooltip>

      <Tooltip title="Justify">
        <IconButton 
          onClick={() => toggleAlign('justify')}
          color={isBlockActive('paragraph', 'justify') ? 'primary' : 'default'}
          size="small"
        >
          <FormatAlignJustify />
        </IconButton>
      </Tooltip>

      <Box sx={{ borderLeft: 1, borderColor: 'divider', mx: 1 }} />

      <Tooltip title="Bulleted List">
        <IconButton 
          onClick={() => toggleBlock('bulleted-list')}
          color={isBlockActive('bulleted-list') ? 'primary' : 'default'}
          size="small"
        >
          <FormatListBulleted />
        </IconButton>
      </Tooltip>

      <Tooltip title="Numbered List">
        <IconButton 
          onClick={() => toggleBlock('numbered-list')}
          color={isBlockActive('numbered-list') ? 'primary' : 'default'}
          size="small"
        >
          <FormatListNumbered />
        </IconButton>
      </Tooltip>

      <Tooltip title="Quote">
        <IconButton 
          onClick={() => toggleBlock('block-quote')}
          color={isBlockActive('block-quote') ? 'primary' : 'default'}
          size="small"
        >
          <FormatQuote />
        </IconButton>
      </Tooltip>

      <Box sx={{ borderLeft: 1, borderColor: 'divider', mx: 1 }} />

      <Tooltip title="Heading 1">
        <IconButton 
          onClick={() => toggleBlock('heading-one')}
          color={isBlockActive('heading-one') ? 'primary' : 'default'}
          size="small"
        >
          <LooksOne />
        </IconButton>
      </Tooltip>

      <Tooltip title="Heading 2">
        <IconButton 
          onClick={() => toggleBlock('heading-two')}
          color={isBlockActive('heading-two') ? 'primary' : 'default'}
          size="small"
        >
          <LooksTwo />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default Toolbar; 