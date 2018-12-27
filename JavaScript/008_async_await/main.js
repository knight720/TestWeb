console.log('1');

const posts = [
    { title: 'Post 1', content: 'fake content'},
    { title: 'Post 2', content: 'fake content'},
  ];

function getPosts() {
    return new Promise(function(resolve) {
        console.log('5');
      setTimeout(function() {
        resolve(posts);
      } , 3000);
      console.log('6');
    });
  }

async function printPostsToConsole() {
    const posts = await getPosts();
    console.log(posts);
    console.log('4');
  };
  
  console.log('2');
  printPostsToConsole();
  console.log('3');

// 1
// 2
// 5
// 6
// 3
// [ { title: 'Post 1', content: 'fake content' },
//   { title: 'Post 2', content: 'fake content' } ]
// 4