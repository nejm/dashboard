
package com.smi.service;

import com.smi.dao.StatUserDao;
import com.smi.model.Statuser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service("statuserService")
public class StatUserServiceImpl implements StatUserService{

    @Autowired
    @Qualifier("statuserDao")
    StatUserDao statUserDao;
    
    @Override
    @Transactional
    public void save(Statuser statuser) {
        statUserDao.save(statuser);
    }

    @Override
    @Transactional
    public void edit(Statuser statuser) {
         statUserDao.edit(statuser);
    }
    
}
