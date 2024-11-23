import dayjs from 'dayjs';

export const getExampleTableApi = (params: any) => {

  const list: any[] = [];
  for( let i = 0; i < 20; i++) {
    list.push({
      id: i,
      category: `category${i}`,
      productName: `productName${i}`,
      price: 20 + (i + 1) * 2,
      releaseDate: dayjs().subtract(i, 'day').format('YYYY-MM-DD'),
      color: `color${i}`,
    });
  }

  return new Promise((resolve) => {
    resolve({
      totalCount: 30,
      items: list,
    });
  });
};
