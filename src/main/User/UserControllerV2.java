package User;

import Database.UserV2.UserV2Dao;
import Security.SecurityUtils;
import User.V2.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.javalin.http.Handler;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;

import java.util.List;
import java.util.Optional;

@Slf4j
public class UserControllerV2 {

  private UserV2Dao userDao;

  public UserControllerV2(UserV2Dao userDao) {
    this.userDao = userDao;
  }

  public Handler signup =
      ctx -> {
        BaseUser payload = ctx.bodyAsClass(BaseUser.class);
        String hash = SecurityUtils.hashPassword(payload.getPassword());
        if (hash == null) {
          log.error("Could not hash password");
          ctx.result(UserMessage.HASH_FAILURE.toResponseString());
        }
        payload.setPassword(hash);
        userDao.save(payload);
        ctx.result(UserMessage.SUCCESS.toResponseString());
      };

  public Handler addInformation =
      ctx -> {
        JSONObject req = new JSONObject(ctx.body());
        Mask.MaskType maskType = Mask.MaskType.valueOf(req.getString("mask"));
        ObjectMapper objectMapper = new ObjectMapper();
        BaseUser baseUser = BaseUser.builder().username(ctx.pathParam("username")).build();
        switch (maskType) {
          case basicInfo:
            BasicInfo basicInfo =
                objectMapper.readValue(req.get("basicInfo").toString(), BasicInfo.class);
            baseUser.setBasicInfo(basicInfo);
            userDao.update(baseUser);
            break;
          case demographicInfo:
            DemographicInfo demographicInfo =
                objectMapper.readValue(
                    req.get("demographicInfo").toString(), DemographicInfo.class);
            baseUser.setDemographicInfo(demographicInfo);
            userDao.update(baseUser);
            break;
          case familyInfo:
            FamilyInfo familyInfo =
                objectMapper.readValue(req.get("familyInfo").toString(), FamilyInfo.class);
            baseUser.setFamilyInfo(familyInfo);
            userDao.update(baseUser);
            break;
          case veteranStatus:
            VeteranStatus veteranStatus =
                objectMapper.readValue(req.get("veteranStatus").toString(), VeteranStatus.class);
            baseUser.setVeteranStatus(veteranStatus);
            userDao.update(baseUser);
            break;
          default:
            ctx.result(UserMessage.SERVER_ERROR.toResponseString());
            break;
        }
      };

  public Handler getInformation =
      ctx -> {
        JSONObject result = new JSONObject();
        Optional<BaseUser> userOptional = userDao.get(ctx.pathParam("username"));
        if (userOptional.isPresent()) {
          BaseUser user = userOptional.get();
          result.put("Base", user.getBaseUser());
          Optional<List<String>> optionalValues = ctx.queryParamMap().values().stream().findFirst();
          if (optionalValues.isPresent()) {
            List<String> values = optionalValues.get();
            for (String v : values) {
              result.put(v, user.getFromString(v));
            }
          }
        }
        ctx.result(result.toString());
      };

  static class Mask {
    public enum MaskType {
      basicInfo,
      demographicInfo,
      familyInfo,
      veteranStatus,
      UNKNOWN
    }

    public static MaskType toString(String mask) {
      try {
        return Enum.valueOf(MaskType.class, mask);
      } catch (Exception e) {
        return MaskType.UNKNOWN;
      }
    }
  }
}
