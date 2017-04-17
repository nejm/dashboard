/*
 * Copyright 2017 Nejm.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.smi.service;

import com.smi.dao.UserDao;
import com.smi.dao.UserDaoImpl;
import com.smi.model.Users;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service("usersService")
public class UserServiceImpl implements UserService{

     UserDao userDao = new UserDaoImpl();
    
    
    @Override
    public Users findByUsername(String username) {
       return userDao.findByUsername(username);
    }

    @Override
    public List<Users> findAll() {
       return userDao.findAll();
    }

    @Override
    public Users findById(long id) {
       return userDao.findById(id);
    }

    @Override
    public List<String> findRoles(long id) {
      return  userDao.findRoles(id);
    }
    
}
