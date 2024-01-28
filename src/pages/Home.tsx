import { Button } from '@mui/material';
import { useState, useEffect } from 'react';
import { marked } from 'marked';
import Prism from 'prismjs'
import 'prism-themes/themes/prism-atom-dark.min.css'


const Home = () => {
  const [data, setData] = useState([]);
  const [currentFolder, setCurrentFolder] = useState();
  const [categoryList, setCategoryList] = useState([]);
  const [currentCategory, setCurrentCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [flag, setFlag] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');

  useEffect(() => {
    Prism.highlightAll();
  });

  useEffect(() => {
    chrome.storage.local.get(['myData', 'category'], function (result) {
      setData(result.myData || []);
      setCategoryList(result.category || []);
      console.log(result.category)
      setIsLoading(true);
    });
  }, []);

  const handleEdit = (e) => {
    e.preventDefault();

    // UUIDに一致するデータオブジェクトを検索
    const itemToEdit = data.find(item => item.id === flag);

    // 編集する項目が見つかった場合にのみ編集モードを有効にする
    if (itemToEdit) {
      setIsEditing(true);
      setEditTitle(itemToEdit.title);
      setEditDescription(itemToEdit.description);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();

    // data 配列内の特定のオブジェクトを更新
    const updatedData = data.map(item => {
      if (item.id === flag) {
        return { ...item, title: editTitle, description: editDescription };
      }
      return item;
    });

    setData(updatedData);
    chrome.storage.local.set({ 'myData': updatedData });
    setIsEditing(false);
  };


  const handleDelete = (itemId) => {
    setFlag('')

    let deletedData = data.filter(item => item.id !== itemId);

    setData(deletedData);

    chrome.storage.local.set({ 'myData': deletedData });
  }

  // カテゴリーに対応するデータが存在するかをチェックする関数
  const doesCategoryHaveData = (category) => {
    if (category == 'all') return true;

    return data.some(item => item.category === category);
  };

  // カテゴリーを削除する関数
  const handleDeleteCategory = (categoryToDelete) => {
    setCurrentCategory('all')

    const updatedCategoryList = categoryList.filter(category => category !== categoryToDelete);
    setCategoryList(updatedCategoryList);

    // Chrome Storageからカテゴリーを削除
    chrome.storage.local.set({ 'category': updatedCategoryList });
  };

  return (
    <div className='container mx-auto h-screen-60 flex  justify-center flex-col'>
      <div className="grid grid-cols-10 gap-5">
        <div className="col-span-6 overflow-x-scroll">
          <ul className='flex gap-2 mb-2'>
            {isLoading && categoryList.map((category, index) => (
              <li key={index} className={`${category == currentCategory ? 'bg-[#4DC0B2]' : ''} text-[16px] cursor-pointer flex gap-2 border border-[#586365] px-2 rounded`} onClick={() => setCurrentCategory(category)}>
                <div>🗂️</div>
                <p>{category}</p>
                {/* {!doesCategoryHaveData(category) && (
                  <Button variant="contained" onClick={() => handleDeleteCategory(category)}>削除</Button>
                )} */}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="grid grid-cols-10 gap-5 w-full">
        <div className='col-span-7 h-[600px] overflow-y-scroll border border-[#586365] rounded p-2'>
          <ul className='flex flex-col gap-3'>
            {currentCategory === 'all' || currentCategory === '' ? (
              data.length > 0 ? (
                data.map((item, index) => (
                  <li key={index} className={`${item.id === flag && 'bg-[#FFC042]'} p-3  shadow-md rounded flex justify-between items-center`}>
                    <p className='text-[15px] h-full w-full cursor-pointer' onClick={() => { !isEditing ? setFlag(item.id) : null }}>{item.title}</p>
                    <Button variant="contained" type='button' onClick={() => { !isEditing ? handleDelete(item.id) : null }}>削除</Button>
                  </li>
                ))
              ) : (
                <li>何も登録されていません。</li>
              )
            ) : (
              data.filter(item => item.category === currentCategory).length > 0 ? (
                data.filter(item => item.category === currentCategory).map((item, index) => (
                  <li key={index} className={`${item.id === flag && 'bg-[#FFC042]'} p-3 shadow-md rounded flex justify-between items-center`}>
                    <p className='text-[15px] cursor-pointer' onClick={() => { !isEditing ? setFlag(item.id) : null }}>{item.title}</p>
                    <Button variant="contained" type='button' onClick={() => { !isEditing ? handleDelete(item.id) : null }}>削除</Button>
                  </li>
                ))
              ) : (
                <li>
                  <p className='mb-3'>このカテゴリーには何も登録されていません。</p>
                  {currentCategory && currentCategory !== 'all' && (
                    <Button variant="contained" onClick={() => handleDeleteCategory(currentCategory)}>削除</Button>
                  )}
                </li>
              )
            )}
          </ul>
        </div>
        {data && <div className='col-span-3'>
          <div className='border border-[#00214d] shadow-md rounded p-3 mb-3 h-[600px]'>
            <form onSubmit={isEditing ? handleSave : handleEdit}>
              {isLoading && data && data.find(item => item.id === flag) ? (
                <>
                  <h2 className='text-[25px] font-bold pb-3 mb-3 border-b-[1px] border-[#586365]'>
                    {isEditing ? <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className='w-full border border-[#586365] p-2 rounded focus:outline-none' /> : data.find(item => item.id == flag).title}
                  </h2>
                  <div className='flex items-center justify-between mb-3'>
                    <p className='text-[15px]'>
                      🔗 <a href={data.find(item => item.id === flag).url} className='text-blue-400'>関連サイト</a>
                    </p>
                    <p className='bg-yellow-300 text-[11px] px-2 py-[2px] rounded'>
                      {data.find(item => item.id === flag).category}
                    </p>
                  </div>
                  <p className='text-[14px] mb-3'>
                    {isEditing ? <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className='w-full h-[200px] resize-none border border-[#586365] p-2 rounded focus:outline-none' /> : <div className='line-numbers language-*' dangerouslySetInnerHTML={{ __html: marked.parse(data.find(item => item.id == flag).description) }} />}
                  </p>
                  <Button variant="outlined" type='submit'>{isEditing ? '決定' : '変更'}</Button>
                </>
              ) : (<p className='h-[200px]'>何も選択されていません。</p>)}
            </form>
          </div>
        </div>}
      </div>
    </div >
  );
}

export default Home;
