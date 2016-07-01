/* @flow */

import { expect } from 'chai';
import { UserModel } from '../../__mocks__/userModel.js';
import count from '../count';
import Resolver from 'graphql-compose/lib/resolver/resolver';
import { GraphQLObjectType, GraphQLInt } from 'graphql';

const UserType = new GraphQLObjectType({
  name: 'MockUserType',
});

describe('count() ->', () => {
  let user1;
  let user2;

  before('clear UserModel collection', (done) => {
    UserModel.collection.drop(() => {
      done();
    });
  });

  before('add test user document to mongoDB', () => {
    user1 = new UserModel({
      name: 'userName1',
      skills: ['js', 'ruby', 'php', 'python'],
      gender: 'male',
      relocation: true,
    });

    user2 = new UserModel({
      name: 'userName2',
      skills: ['go', 'erlang'],
      gender: 'female',
      relocation: false,
    });

    return Promise.all([
      user1.save(),
      user2.save(),
    ]);
  });

  it('should return Resolver object', () => {
    const resolver = count(UserModel, UserType);
    expect(resolver).to.be.instanceof(Resolver);
  });

  describe('Resolver.args', () => {
    it('should have `filter` arg', () => {
      const resolver = count(UserModel, UserType);
      expect(resolver.hasArg('filter')).to.be.true;
    });
  });

  describe('Resolver.resolve():Promise', () => {
    it('should be fulfilled promise', async () => {
      const result = count(UserModel, UserType).resolve({});
      await expect(result).be.fulfilled;
    });

    it('should return total number of documents in collection if args is empty', async () => {
      const result = await count(UserModel, UserType).resolve({ args: {} });
      expect(result).to.equal(2);
    });

    it('should return number of document by filter data', async () => {
      const result = await count(UserModel, UserType).resolve(
        { args: { filter: { gender: 'male' } } }
      );
      expect(result).to.equal(1);
    });
  });

  describe('Resolver.getOutputType()', () => {
    it('should return GraphQLInt type', () => {
      const outputType = count(UserModel, UserType).getOutputType();
      expect(outputType).to.equal(GraphQLInt);
    });
  });
});
