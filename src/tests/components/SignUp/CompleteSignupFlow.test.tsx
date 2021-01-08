import { addHttp } from '../../../components/SignUp/CompleteSignupFlow';

test('add http test', () => {
  expect(addHttp('https://example.com')).toBe('https://example.com');
  expect(addHttp('https://www.example.com')).toBe('https://www.example.com');
  expect(addHttp('www.example.org/somethinghere')).toBe('http://www.example.org/somethinghere');
});
