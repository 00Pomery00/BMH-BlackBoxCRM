import fastapi_users.authentication as a
import inspect
print('names:', dir(a))
print('\nsource file:', getattr(a,'__file__',None))
for name in ['JWTAuthentication','authentication','JWTStrategy','CookieAuthentication','AuthenticationBackend','Strategy','JWTStrategy']:
    print(name, hasattr(a,name))
