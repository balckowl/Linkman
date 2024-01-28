import { createRoot } from 'react-dom/client';
/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { useEffect, useState } from 'react';
import { Autocomplete, Button, TextField } from '@mui/material';
import { v4 as uuid } from "uuid";
import toast, { Toaster } from 'react-hot-toast';

const Script = () => {
  const [selectedText, setSelectedText] = useState('');
  const [description, setDescription] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [category, setCategory] = useState('');
  const [categoryList, setCategoryList] = useState([]);
  const isClient = typeof window === 'object';

  useEffect(() => {
    if (!isClient) {
      return;
    }

    const handleMouseUp = () => {
      const text = window.getSelection()?.toString();
      if (text) {
        setSelectedText(text);
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'Tab' && selectedText) {
        e.preventDefault(); // デフォルトのTab挙動を防ぐ
        setShowPopup(true);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [isClient, selectedText]);

  useEffect(() => {
    setCurrentUrl(window.location.href);

    chrome.storage.local.get(['category'], function (result) {
      if (result.category && result.category.length > 0) {
        const filteredCategories = result.category.filter(cat => cat && cat !== 'all');
        setCategoryList(filteredCategories);
      }
    });
  }, [])

  const overlayStyle = css({
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 薄暗い背景
    display: showPopup ? 'block' : 'none',
    zIndex: 1000,
  });

  const popupStyle = css({
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    padding: '50px',
    borderRadius: '10px',
    display: showPopup ? 'block' : 'none',
    zIndex: 1001,
  });

  const closeButtonStyle = css({
    position: 'absolute',
    top: '10px',
    right: '10px',
    cursor: 'pointer',
    zIndex: 1002,
  });

  const textFieldListStyle = css({
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  })

  const handleSubmit = (e) => {
    e.preventDefault();

    const toastId = toast.loading('送信中...');
    // Chrome Storageからデータを取得
    chrome.storage.local.get(['myData', 'category'], function (result) {
      const existingWordList = result.myData || [];
      const existingCategoryList = result.category || ['all'];
      console.log(existingWordList);

      // 新しいオブジェクトを配列に追加
      const wordList = [{ title: selectedText, url: currentUrl, category: category, description: description, id: uuid() }, ...existingWordList];

      let categoryList = existingCategoryList;
      if (!existingCategoryList.includes(category)) {
        categoryList = [...existingCategoryList, category];
      }

      console.log('送信されました');

      // Chrome Storageにデータを保存
      chrome.storage.local.set({ 'myData': wordList, 'category': categoryList }); // 'myData' キーを使用

      toast.success('送信成功', { id: toastId });

      setSelectedText('');
      setDescription('');
      setCategory('');
      setCurrentUrl('');
      setDescription('');
    });
  }

  return (
    <div>
      {isClient && showPopup && <div css={overlayStyle} />}
      {isClient && (
        <div css={popupStyle}>
          <Toaster />
          <div css={closeButtonStyle} onClick={() => setShowPopup(false)}>✖</div>
          <form onSubmit={handleSubmit}>
            <div css={textFieldListStyle}>
              <TextField
                id="outlined-basic"
                label="word"
                variant="outlined"
                value={selectedText}
                onChange={(e) => setSelectedText(e.target.value)}
                sx={{ width: '400px' }}
                required
              />
              <TextField
                id="outlined-basic"
                label="URL"
                variant="outlined"
                value={currentUrl}
                sx={{ width: '400px' }}
                onChange={(e) => setCurrentUrl(e.target.value)}
                required
              />
              <Autocomplete
                freeSolo
                id="category-autocomplete"
                options={categoryList}
                value={category}
                onChange={(event, newValue) => {
                  setCategory(newValue);
                }}
                getOptionLabel={(option) => option ? option : ''}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Category"
                    variant="outlined"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  />
                )}
              />
              <TextField
                id="outlined-multiline-static"
                label="description"
                multiline
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <Button variant="outlined" type='submit'>Submit</Button>
            </div>
          </form>
        </div>
      )
      }
    </div >
  );
};

// ページ上に新しい要素を作成
const app = document.createElement('div');
app.id = "my-extension-root";

// 新しい要素をbodyの最初の子として挿入
document.body.insertBefore(app, document.body.firstChild);

// 新しいAPIを使用してReactコンポーネントをレンダリング
const root = createRoot(app);
root.render(<Script />);
